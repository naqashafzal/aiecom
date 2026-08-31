import { db } from "@/lib/prisma";
import { DollarSign, ArrowUpRight, TrendingUp, Users, ShoppingCart, Activity, Globe, Link as LinkIcon, Search } from "lucide-react";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import AnalyticsChart from "@/components/admin/AnalyticsChart";
import { getFormatPrice, getStoreCurrency } from "@/lib/format";

export const revalidate = 0; // Disable static rendering for this page

export default async function AdminAnalyticsPage() {
  const usersCount = await db.user.count();
  const ordersCount = await db.order.count();
  
  const formatPrice = await getFormatPrice();
  const currencyCode = await getStoreCurrency();
  
  const revenueObj = await db.order.aggregate({
    _sum: { grandTotal: true },
    where: { paymentStatus: 'PAID' }
  });
  const revenue = revenueObj._sum.grandTotal || 0;

  // Real data for the chart to show past 7 days of activity
  const today = new Date();
  const chartData = [];
  
  // We'll calculate total revenue and orders per day for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const targetDate = subDays(today, i);
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);
    
    const dailyOrders = await db.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        paymentStatus: 'PAID' // Only count paid orders towards revenue
      }
    });

    const dailyRevenue = dailyOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
    
    const allDailyOrdersCount = await db.order.count({
      where: {
        createdAt: { gte: start, lte: end }
      }
    });

    chartData.push({
      day: format(targetDate, 'EEE'),
      revenue: dailyRevenue,
      orders: allDailyOrdersCount
    });
  }

  // Real data for Top Categories and Products
  // Using queryRaw to avoid pulling all order items into memory
  const categoryRevenueRaw = await db.$queryRaw<any[]>`
    SELECT c.name, SUM(oi.price * oi.quantity) as total
    FROM "OrderItem" oi
    JOIN "Order" o ON oi."orderId" = o.id
    JOIN "_CategoryToProduct" ctp ON oi."productId" = ctp."B"
    JOIN "Category" c ON ctp."A" = c.id
    WHERE o."paymentStatus" = 'PAID'
    GROUP BY c.name
    ORDER BY total DESC
    LIMIT 3
  `;

  let totalCategoryRevenue = 0;
  const topCategories = categoryRevenueRaw.map(row => {
    const total = Number(row.total || 0);
    totalCategoryRevenue += total;
    return { name: row.name || "Uncategorized", total, percentage: 0 };
  });

  if (totalCategoryRevenue > 0) {
    topCategories.forEach(cat => {
      cat.percentage = Math.round((cat.total / totalCategoryRevenue) * 100);
    });
  }

  const productRevenueRaw = await db.$queryRaw<any[]>`
    SELECT p.id, p.name, SUM(oi.price * oi.quantity) as revenue, SUM(oi.quantity) as units, 
           (SELECT url FROM "ProductImage" pi WHERE pi."productId" = p.id LIMIT 1) as image
    FROM "OrderItem" oi
    JOIN "Order" o ON oi."orderId" = o.id
    JOIN "Product" p ON oi."productId" = p.id
    WHERE o."paymentStatus" = 'PAID'
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 5
  `;

  const topProducts = productRevenueRaw.map(row => ({
    id: row.id,
    name: row.name,
    image: row.image || "/placeholder.png",
    revenue: Number(row.revenue || 0),
    units: Number(row.units || 0)
  }));

  const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500"];

  // Dynamic Insights
  const aov = ordersCount > 0 ? (revenue / ordersCount) : 0;
  const isAovLow = aov < 50;

  // Live Traffic (Last 30 minutes)
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  const activeVisitorsCount = await db.visitor.count({
    where: {
      updatedAt: { gte: thirtyMinsAgo }
    }
  });

  // Advanced Traffic Intelligence (Last 30 Days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  
  const topSourcesRaw = await db.pageView.groupBy({
    by: ['referrer'],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: { referrer: true },
    orderBy: { _count: { referrer: 'desc' } },
    take: 5
  });

  const topSources = topSourcesRaw.map(s => [s.referrer || "Direct", s._count.referrer]);

  const topCountriesRaw = await db.$queryRaw<any[]>`
    SELECT v.country, COUNT(p.id) as count
    FROM "PageView" p
    JOIN "Visitor" v ON p."visitorId" = v.id
    WHERE p."createdAt" >= ${thirtyDaysAgo}
    GROUP BY v.country
    ORDER BY count DESC
    LIMIT 5
  `;
  const topCountries = topCountriesRaw.map(c => [c.country || "Unknown", Number(c.count || 0)]);

  // For keywords, we just extract from a limited set of recent searches to save memory
  const recentSearches = await db.pageView.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      url: { contains: '?' }
    },
    select: { url: true },
    take: 5000,
    orderBy: { createdAt: 'desc' }
  });

  const searchKeywords: Record<string, number> = {};
  recentSearches.forEach(pv => {
    try {
      const urlParams = new URLSearchParams(pv.url.split('?')[1]);
      const q = urlParams.get('q') || urlParams.get('search') || urlParams.get('query');
      if (q) {
        const keyword = q.toLowerCase().trim();
        if (keyword.length > 0) {
          searchKeywords[keyword] = (searchKeywords[keyword] || 0) + 1;
        }
      }
    } catch (e) {
      // Ignored
    }
  });
  
  const topKeywords = Object.entries(searchKeywords).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // --- Customer Intelligence ---
  const customerSpendRaw = await db.$queryRaw<any[]>`
    SELECT 
      COALESCE(u.email, o.email, 'Unknown') as email, 
      COALESCE(u.name, 'Guest') as name, 
      SUM(o."grandTotal") as "totalSpend", 
      COUNT(o.id) as "orderCount"
    FROM "Order" o
    LEFT JOIN "User" u ON o."userId" = u.id
    WHERE o."paymentStatus" = 'PAID'
    GROUP BY COALESCE(u.email, o.email, 'Unknown'), COALESCE(u.name, 'Guest')
    ORDER BY "totalSpend" DESC
  `;

  const uniqueCustomersCount = customerSpendRaw.filter(c => c.email !== 'Unknown').length;
  const lifetimeValue = uniqueCustomersCount > 0 ? (revenue / uniqueCustomersCount) : 0;
  
  const vipCustomers = customerSpendRaw
    .filter(c => c.email !== 'Unknown')
    .slice(0, 5)
    .map(c => ({
      email: c.email,
      name: c.name,
      totalSpend: Number(c.totalSpend || 0),
      orderCount: Number(c.orderCount || 0)
    }));

  let newCustomers = 0;
  let returningCustomers = 0;
  
  customerSpendRaw.forEach(customer => {
    if (customer.email !== 'Unknown') {
      if (Number(customer.orderCount || 0) > 1) {
        returningCustomers++;
      } else {
        newCustomers++;
      }
    }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#202223]">Analytics Overview</h1>
        <p className="text-muted-foreground mt-1">Track your store's performance and customer behavior in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold break-words">{formatPrice(revenue)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold">{ordersCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customers</p>
              <h3 className="text-2xl font-bold">{usersCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-20 w-20 text-green-500" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-green-100 rounded-lg text-green-600 relative">
              <Activity className="h-6 w-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Visitors</p>
              <h3 className="text-2xl font-bold">{activeVisitorsCount}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-muted-foreground relative z-10">
            <span>In the last 30 minutes</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-[#202223]">Revenue & Orders (Last 7 Days)</h2>
            <p className="text-sm text-muted-foreground">Daily performance metrics</p>
          </div>
        </div>
        
        {/* Recharts Component */}
        <AnalyticsChart data={chartData} currencyCode={currencyCode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow lg:col-span-1">
          <h2 className="text-lg font-bold mb-4 text-[#202223]">Top Categories</h2>
          <div className="space-y-5">
            {topCategories.length > 0 ? topCategories.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3 group">
                <span className="text-sm font-medium w-[40%] truncate" title={cat.name}>{cat.name}</span>
                <div className="w-[40%] h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full ${colors[i % colors.length]} transition-all duration-1000 ease-out group-hover:opacity-80`} style={{ width: `${cat.percentage}%` }}></div>
                </div>
                <div className="flex flex-col items-end w-[20%]">
                  <span className="text-sm font-bold">{cat.percentage}%</span>
                </div>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground py-4">Not enough data to display top categories.</div>
            )}
          </div>
        </div>

        {/* Traffic Details */}
        <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow lg:col-span-1">
          <div className="flex items-center justify-between mb-4 text-[#202223]">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold">Top Countries</h2>
            </div>
            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">30 Days</span>
          </div>
          <div className="space-y-4">
            {topCountries.length > 0 ? topCountries.map(([country, count]) => (
              <div key={country} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-muted-foreground">{country}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{count}</span>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground">No visitor data.</div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6 mb-4 text-[#202223]">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold">Top Search Queries</h2>
            </div>
          </div>
          <div className="space-y-4">
            {topKeywords.length > 0 ? topKeywords.map(([keyword, count]) => (
              <div key={keyword} className="flex justify-between items-start gap-2 text-sm border-b pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-muted-foreground break-all">"{keyword}"</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold shrink-0">{count}</span>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground">No search queries tracked yet.</div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6 mb-4 text-[#202223]">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-bold">Top Sources</h2>
            </div>
          </div>
          <div className="space-y-4">
            {topSources.length > 0 ? topSources.map(([source, count]) => (
              <div key={source} className="flex justify-between items-start gap-2 text-sm border-b pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-muted-foreground break-all">{source}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold shrink-0">{count}</span>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground">No traffic sources recorded.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-[#202223]">Store Insights</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors">
              <h4 className="font-semibold text-sm">Average Order Value</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Your AOV is <strong>{formatPrice(aov)}</strong>. 
                {isAovLow 
                  ? " Consider creating product bundles or offering free shipping over a certain threshold to increase this metric." 
                  : " Great job! Your AOV is healthy. Focus on customer retention to maximize LTV."}
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors">
              <h4 className="font-semibold text-sm text-primary">Sales Velocity</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your last 7 days of data, your store generated <strong>{formatPrice(chartData.reduce((acc, curr) => acc + curr.revenue, 0))}</strong> in recent revenue.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
        <h2 className="text-lg font-bold mb-4 text-[#202223]">Top Performing Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Product</th>
                <th className="px-4 py-3 text-right">Units Sold</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? topProducts.map((prod) => (
                <tr key={prod.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-md object-cover border" />
                    <span className="font-medium truncate max-w-[200px] sm:max-w-[400px]" title={prod.name}>{prod.name}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{prod.units}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{formatPrice(prod.revenue)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No product data available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#202223]">Customer Retention</h2>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 border rounded-lg bg-gray-50/50">
              <p className="text-sm font-medium text-muted-foreground">New Customers</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{newCustomers}</h3>
              <p className="text-xs text-muted-foreground mt-1">First-time buyers</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50/50">
              <p className="text-sm font-medium text-muted-foreground">Returning</p>
              <h3 className="text-2xl font-bold mt-1 text-indigo-600">{returningCustomers}</h3>
              <p className="text-xs text-muted-foreground mt-1">Repeat buyers</p>
            </div>
          </div>
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
            <h4 className="font-semibold text-sm text-indigo-900">Customer Lifetime Value (LTV)</h4>
            <p className="text-xs text-indigo-700 mt-1 mb-2">The average total revenue generated per unique customer.</p>
            <span className="text-2xl font-bold text-indigo-700">{formatPrice(lifetimeValue)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold mb-4 text-[#202223]">Top VIP Customers</h2>
          <div className="space-y-4">
            {vipCustomers.length > 0 ? vipCustomers.map((customer, index) => (
              <div key={customer.email} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-gray-100 text-gray-600'}`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm truncate max-w-[120px]" title={customer.name}>{customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]" title={customer.email}>{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-green-600">{formatPrice(customer.totalSpend)}</p>
                  <p className="text-xs text-muted-foreground">{customer.orderCount} orders</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-sm text-muted-foreground">No customer purchase data available yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

