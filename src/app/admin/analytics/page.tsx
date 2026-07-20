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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics Overview</h1>
          <p className="text-slate-500 mt-1">Track your store's performance and customer behavior in real-time.</p>
        </div>
        <div className="px-4 py-2 bg-white text-slate-600 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-200 shadow-sm">
          <Globe className="h-4 w-4 text-slate-400" /> Global Time
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Total Revenue</p>
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 truncate" title={formatPrice(revenue)}>{formatPrice(revenue)}</h3>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Total Orders</p>
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900">{ordersCount}</h3>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Customers</p>
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900">{usersCount}</h3>
        </div>

        {/* Live Traffic Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-lg relative">
              <Activity className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            </div>
            <p className="text-sm font-semibold text-slate-600">Active Now</p>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900">{activeVisitorsCount}</h3>
            <p className="text-xs text-slate-500 mt-1">In the last 30 minutes</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Revenue & Orders</h2>
            <p className="text-sm text-slate-500 mt-1">Last 7 Days Performance</p>
          </div>
        </div>
        
        {/* Recharts Component */}
        <AnalyticsChart data={chartData} currencyCode={currencyCode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Top Categories</h2>
          <div className="space-y-5">
            {topCategories.length > 0 ? topCategories.map((cat, i) => (
              <div key={cat.name} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold text-slate-700 truncate pr-4">{cat.name}</span>
                  <span className="text-sm font-bold text-slate-900">{cat.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-slate-500 py-4 text-center">Not enough data to display top categories.</div>
            )}
          </div>
        </div>

        {/* Live Traffic Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-900">Top Countries</h2>
          </div>
          <div className="space-y-3 mb-8">
            {topCountries.length > 0 ? topCountries.map(([country, count]) => (
              <div key={country} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-slate-600">{country}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">{count}</span>
              </div>
            )) : (
              <div className="text-sm text-slate-500 text-center py-2">No active visitors.</div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-bold text-slate-900">Top Sources</h2>
          </div>
          <div className="space-y-3">
            {topSources.length > 0 ? topSources.map(([source, count]) => (
              <div key={source} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-slate-600 truncate max-w-[150px]">{source}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">{count}</span>
              </div>
            )) : (
              <div className="text-sm text-slate-500 text-center py-2">No traffic sources.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900">Store Insights</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="font-semibold text-sm text-slate-700 mb-1">Average Order Value</h4>
              <p className="text-sm text-slate-600">
                Your AOV is <strong className="text-slate-900 font-bold">{formatPrice(aov)}</strong>. 
                {isAovLow 
                  ? " Consider creating product bundles or offering free shipping over a certain threshold." 
                  : " Great job! Your AOV is healthy. Focus on customer retention."}
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <h4 className="font-semibold text-sm text-indigo-700 mb-1">Sales Velocity</h4>
              <p className="text-sm text-indigo-900/80">
                Based on your last 7 days of data, your store generated <strong className="text-indigo-900 font-bold">{formatPrice(chartData.reduce((acc, curr) => acc + curr.revenue, 0))}</strong> in recent revenue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

