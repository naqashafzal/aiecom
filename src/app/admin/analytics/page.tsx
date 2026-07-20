import { db } from "@/lib/prisma";
import { DollarSign, ArrowUpRight, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

export const revalidate = 0; // Disable static rendering for this page

export default async function AdminAnalyticsPage() {
  const usersCount = await db.user.count();
  const ordersCount = await db.order.count();
  
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
    
    // We count all orders created on that day, regardless of payment status for the "orders" metric, 
    // but revenue is only for PAID orders.
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

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#202223]">Analytics Overview</h1>
        <p className="text-muted-foreground mt-1">Track your store's performance and customer behavior in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold">${revenue.toFixed(2)}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <ArrowUpRight className="h-4 w-4 mr-1" /> All time
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold">{ordersCount}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <ArrowUpRight className="h-4 w-4 mr-1" /> All time
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registered Customers</p>
              <h3 className="text-2xl font-bold">{usersCount}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center font-medium">
              <ArrowUpRight className="h-4 w-4 mr-1" /> All time
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-[#202223]">Revenue & Orders (Last 7 Days)</h2>
            <p className="text-sm text-muted-foreground">Daily performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center text-xs font-medium text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-primary mr-2"></span> Revenue
            </span>
          </div>
        </div>

        {/* Pure CSS Bar Chart - Dynamic */}
        <div className="h-64 flex items-end justify-between gap-2 pt-4">
          {chartData.map((data, i) => (
            <div key={i} className="flex flex-col items-center flex-1 group">
              <div className="w-full relative flex justify-center flex-1 items-end rounded-t-sm">
                {/* Tooltip */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1.5 px-3 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap">
                  <div className="font-semibold">${data.revenue.toFixed(2)}</div>
                  <div className="text-slate-300">{data.orders} orders</div>
                </div>
                {/* Bar */}
                <div 
                  className="w-full max-w-[40px] bg-primary rounded-t-md transition-all duration-500 group-hover:bg-primary/80 group-hover:-translate-y-1"
                  style={{ height: `${(data.revenue / maxRevenue) * 100}%`, minHeight: data.revenue > 0 ? '5%' : '2%' }}
                ></div>
              </div>
              <div className="mt-4 text-xs font-medium text-muted-foreground border-t w-full text-center pt-2">
                {data.day}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold mb-4 text-[#202223]">Top Performing Categories</h2>
          <div className="space-y-5">
            {topCategories.length > 0 ? topCategories.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between group">
                <span className="text-sm font-medium min-w-[120px]">{cat.name}</span>
                <div className="flex-1 mx-4 h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full ${colors[i % colors.length]} transition-all duration-1000 ease-out group-hover:opacity-80`} style={{ width: `${cat.percentage}%` }}></div>
                </div>
                <div className="flex flex-col items-end min-w-[50px]">
                  <span className="text-sm font-bold">{cat.percentage}%</span>
                  <span className="text-[10px] text-muted-foreground">${cat.total.toFixed(0)}</span>
                </div>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground py-4">Not enough data to display top categories.</div>
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
                Your AOV is <strong>${aov.toFixed(2)}</strong>. 
                {isAovLow 
                  ? " Consider creating product bundles or offering free shipping over a certain threshold to increase this metric." 
                  : " Great job! Your AOV is healthy. Focus on customer retention to maximize LTV."}
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors">
              <h4 className="font-semibold text-sm text-primary">Sales Velocity</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your last 7 days of data, your store generated <strong>${chartData.reduce((acc, curr) => acc + curr.revenue, 0).toFixed(2)}</strong> in recent revenue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

