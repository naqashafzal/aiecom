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
  let totalCategoryRevenue = 0;

  paidOrderItems.forEach(item => {
    const catName = item.product?.categories?.[0]?.name || "Uncategorized";
    if (!categoryRevenue[catName]) {
      categoryRevenue[catName] = { name: catName, total: 0 };
    }
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    categoryRevenue[catName].total += itemTotal;
    totalCategoryRevenue += itemTotal;
  });

  const topCategories = Object.values(categoryRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(cat => ({
      ...cat,
      percentage: totalCategoryRevenue > 0 ? Math.round((cat.total / totalCategoryRevenue) * 100) : 0
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
    </div>
  );
}

