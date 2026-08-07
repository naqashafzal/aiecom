import { db } from "@/lib/prisma";
import { DollarSign, ArrowUpRight, TrendingUp, Users, ShoppingCart, Activity, Globe, Link as LinkIcon } from "lucide-react";
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

  // Real data for Top Categories
  const paidOrderItems = await db.orderItem.findMany({
    where: {
      order: {
        paymentStatus: 'PAID'
      }
    },
    include: {
      product: {
        include: {
          categories: true
        }
      }
    }
  });

  const categoryRevenue: Record<string, { name: string, total: number }> = {};
  const productRevenue: Record<string, { id: string, name: string, image: string, revenue: number, units: number }> = {};
  let totalCategoryRevenue = 0;

  paidOrderItems.forEach(item => {
    // Categories
    const catName = item.product?.categories?.[0]?.name || "Uncategorized";
    if (!categoryRevenue[catName]) {
      categoryRevenue[catName] = { name: catName, total: 0 };
    }
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    categoryRevenue[catName].total += itemTotal;
    totalCategoryRevenue += itemTotal;

    // Products
    if (item.product) {
      const prodId = item.productId;
      if (!productRevenue[prodId]) {
        productRevenue[prodId] = {
          id: item.product.id,
          name: item.product.name,
          image: item.product.images?.[0]?.url || "/placeholder.png",
          revenue: 0,
          units: 0
        };
      }
      productRevenue[prodId].revenue += itemTotal;
      productRevenue[prodId].units += (item.quantity || 1);
    }
  });

  const topCategories = Object.values(categoryRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(cat => ({
      ...cat,
      percentage: totalCategoryRevenue > 0 ? Math.round((cat.total / totalCategoryRevenue) * 100) : 0
    }));

  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

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

  const recentPageViews = await db.pageView.findMany({
    where: {
      createdAt: { gte: thirtyMinsAgo }
    },
    include: { visitor: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const sources: Record<string, number> = {};
  const countries: Record<string, number> = {};
  
  recentPageViews.forEach(pv => {
    const src = pv.referrer && pv.referrer.length > 0 ? pv.referrer : "Direct";
    sources[src] = (sources[src] || 0) + 1;
    
    const country = pv.visitor.country || "Unknown";
    countries[country] = (countries[country] || 0) + 1;
  });

  const topSources = Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // --- Customer Intelligence ---
  const allPaidOrders = await db.order.findMany({
    where: { paymentStatus: 'PAID' },
    include: { user: true }
  });

  const customerSpend: Record<string, { email: string, name: string, totalSpend: number, orderCount: number }> = {};
  
  allPaidOrders.forEach(order => {
    // Group by email to catch guest checkouts and registered users together
    const email = order.email || order.user?.email || "Unknown";
    const name = order.user?.name || "Guest";
    
    if (email !== "Unknown") {
      if (!customerSpend[email]) {
        customerSpend[email] = { email, name, totalSpend: 0, orderCount: 0 };
      }
      customerSpend[email].totalSpend += (order.grandTotal || 0);
      customerSpend[email].orderCount += 1;
    }
  });

  const uniqueCustomersCount = Object.keys(customerSpend).length;
  const lifetimeValue = uniqueCustomersCount > 0 ? (revenue / uniqueCustomersCount) : 0;
  
  const vipCustomers = Object.values(customerSpend)
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5);

  let newCustomers = 0;
  let returningCustomers = 0;
  
  Object.values(customerSpend).forEach(customer => {
    if (customer.orderCount > 1) {
      returningCustomers++;
    } else {
      newCustomers++;
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

        {/* Live Traffic Details */}
        <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow lg:col-span-1">
          <div className="flex items-center gap-2 mb-4 text-[#202223]">
            <Globe className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold">Top Countries</h2>
          </div>
          <div className="space-y-4">
            {topCountries.length > 0 ? topCountries.map(([country, count]) => (
              <div key={country} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-muted-foreground">{country}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{count}</span>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground">No active visitors.</div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-6 mb-4 text-[#202223]">
            <LinkIcon className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-bold">Top Sources</h2>
          </div>
          <div className="space-y-4">
            {topSources.length > 0 ? topSources.map(([source, count]) => (
              <div key={source} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-muted-foreground truncate max-w-[150px]">{source}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{count}</span>
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

