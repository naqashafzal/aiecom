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
    <div className="space-y-8 max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Analytics Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Track your store's performance and customer behavior in real-time.</p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold uppercase tracking-widest flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">
          <Globe className="h-4 w-4" /> Global Time
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card - Premium Gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-800 p-8 shadow-2xl shadow-indigo-500/20 text-white hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -top-10 -right-10 opacity-10">
            <DollarSign className="h-40 w-40" />
          </div>
          <div className="relative z-10 flex flex-col gap-3">
            <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Total Revenue</p>
            <h3 className="text-5xl font-black tracking-tighter drop-shadow-sm">{formatPrice(revenue)}</h3>
          </div>
        </div>

        {/* Orders Card - Glass/Clean */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Orders</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1">{ordersCount}</h3>
            </div>
          </div>
        </div>

        {/* Customers Card - Glass/Clean */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex flex-col gap-4">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Customers</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1">{usersCount}</h3>
            </div>
          </div>
        </div>

        {/* Live Traffic Card - Animated */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-black p-8 shadow-2xl text-white hover:-translate-y-1 transition-transform duration-300 group border border-slate-800">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
            <div className="w-32 h-32 bg-green-500 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Activity className="h-6 w-6 text-green-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
              <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Active Now</p>
            </div>
            <div>
              <h3 className="text-5xl font-black tracking-tighter text-white">{activeVisitorsCount}</h3>
              <p className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-wider">In the last 30 minutes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Revenue & Orders</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Last 7 Days Performance</p>
          </div>
        </div>
        
        {/* Recharts Component */}
        <AnalyticsChart data={chartData} currencyCode={currencyCode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 lg:col-span-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Top Categories</h2>
          <div className="space-y-6">
            {topCategories.length > 0 ? topCategories.map((cat, i) => (
              <div key={cat.name} className="flex flex-col gap-2 group">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{cat.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full ${colors[i % colors.length]} transition-all duration-1000 ease-out group-hover:brightness-110 rounded-full`} style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="text-sm font-medium text-slate-500 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 text-center">Not enough data to display top categories.</div>
            )}
          </div>
        </div>

        {/* Live Traffic Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Top Countries</h2>
          </div>
          <div className="space-y-3 mb-8">
            {topCountries.length > 0 ? topCountries.map(([country, count]) => (
              <div key={country} className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="font-bold text-slate-600 dark:text-slate-300">{country}</span>
                <span className="bg-white dark:bg-slate-700 shadow-sm px-3 py-1 rounded-lg font-black text-slate-900 dark:text-white">{count}</span>
              </div>
            )) : (
              <div className="text-sm font-medium text-slate-500 text-center py-2">No active visitors.</div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-600 dark:text-purple-400">
              <LinkIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Top Sources</h2>
          </div>
          <div className="space-y-3">
            {topSources.length > 0 ? topSources.map(([source, count]) => (
              <div key={source} className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{source}</span>
                <span className="bg-white dark:bg-slate-700 shadow-sm px-3 py-1 rounded-lg font-black text-slate-900 dark:text-white">{count}</span>
              </div>
            )) : (
              <div className="text-sm font-medium text-slate-500 text-center py-2">No traffic sources.</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-pink-100 dark:bg-pink-900/40 rounded-xl text-pink-600 dark:text-pink-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Store Insights</h2>
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <h4 className="font-black text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Average Order Value</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Your AOV is <strong className="text-slate-900 dark:text-white font-black text-lg ml-1 mr-1">{formatPrice(aov)}</strong>. 
                {isAovLow 
                  ? " Consider creating product bundles or offering free shipping over a certain threshold." 
                  : " Great job! Your AOV is healthy. Focus on customer retention."}
              </p>
            </div>
            <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition-colors">
              <h4 className="font-black text-sm uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">Sales Velocity</h4>
              <p className="text-sm text-indigo-900/70 dark:text-indigo-200/70 leading-relaxed">
                Based on your last 7 days of data, your store generated <strong className="text-indigo-900 dark:text-indigo-100 font-black text-lg ml-1 mr-1">{formatPrice(chartData.reduce((acc, curr) => acc + curr.revenue, 0))}</strong> in recent revenue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

