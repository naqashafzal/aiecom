import { 
  Calendar,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Package,
  CreditCard,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import Link from "next/link";
import AdminChatAgent from "@/components/admin/AdminChatAgent";
import { getFormatPrice } from "@/lib/format";

export default async function AdminDashboard() {
  const formatPrice = await getFormatPrice();
  const ordersCount = await db.order.count();
  
  const revenueObj = await db.order.aggregate({
    _sum: { grandTotal: true },
    where: { paymentStatus: 'PAID' }
  });
  const revenue = revenueObj._sum.grandTotal || 0;

  const topProducts = await db.product.findMany({
    take: 5,
    orderBy: { price: 'desc' }
  });

  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { shippingAddress: true }
  });

  const ordersToFulfill = await db.order.count({
    where: {
      status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] }
    }
  });

  const paymentsToCapture = await db.order.count({
    where: {
      paymentStatus: 'PENDING'
    }
  });

  // Calculate Average Order Value (AOV)
  const aov = ordersCount > 0 ? (revenue / ordersCount) : 0;

  // Calculate Customer Retention Rate (Users with > 1 order)
  const usersWithOrders = await db.order.groupBy({
    by: ['userId'],
    _count: { userId: true },
    where: { userId: { not: null } }
  });
  
  let returningUsers = 0;
  usersWithOrders.forEach(user => {
    if (user._count.userId > 1) {
      returningUsers++;
    }
  });
  const totalPurchasingUsers = usersWithOrders.length;
  const retentionRate = totalPurchasingUsers > 0 ? ((returningUsers / totalPurchasingUsers) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      
      {/* Date & Channels Filter */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-white border border-[#c9cccf] rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-[#f6f6f7] transition-colors">
          <Calendar className="h-4 w-4 text-[#5c5f62]" />
          All time
          <ChevronDown className="h-3 w-3 text-[#5c5f62] ml-1" />
        </button>
        <button className="flex items-center gap-2 bg-white border border-[#c9cccf] rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm hover:bg-[#f6f6f7] transition-colors">
          All channels
          <ChevronDown className="h-3 w-3 text-[#5c5f62] ml-1" />
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e5] p-5 hover:shadow-md transition-shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#e1e3e5]">
          
          {/* Total Sales */}
          <div className="pl-0 pt-4 md:pt-0 group">
            <h3 className="text-xs font-semibold text-[#5c5f62] mb-1 group-hover:text-[#202223] transition-colors">Total sales</h3>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-base font-semibold">{formatPrice(revenue)}</span>
            </div>
            <div className="mt-4 h-6 w-full flex items-end opacity-80 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full text-blue-500" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,15 Q10,20 20,10 T40,12 T60,5 T80,18 T100,2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
          
          {/* Orders */}
          <div className="md:pl-8 pt-4 md:pt-0 group">
            <h3 className="text-xs font-semibold text-[#5c5f62] mb-1 group-hover:text-[#202223] transition-colors">Orders</h3>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-base font-semibold">{ordersCount}</span>
            </div>
            <div className="mt-4 h-6 w-full flex items-end opacity-80 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full text-blue-500" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 Q20,5 40,15 T70,8 T100,2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="md:pl-8 pt-4 md:pt-0 group">
            <h3 className="text-xs font-semibold text-[#5c5f62] mb-1 group-hover:text-[#202223] transition-colors">Average Order Value</h3>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-base font-semibold">{formatPrice(aov)}</span>
            </div>
            <div className="mt-4 h-6 w-full flex items-end opacity-80 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full text-green-500" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,18 L20,18 L20,5 L40,5 L40,18 L60,18 L60,10 L80,10 L80,18 L100,18" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Customer Retention */}
          <div className="md:pl-8 pt-4 md:pt-0 relative group">
            <h3 className="text-xs font-semibold text-[#5c5f62] mb-1 group-hover:text-[#202223] transition-colors">Customer Retention</h3>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-base font-semibold">{retentionRate}%</span>
            </div>
            <div className="mt-4 h-6 w-full flex items-end opacity-80 group-hover:opacity-100 transition-opacity">
              <svg className="w-full h-full text-purple-500" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,18 L30,18 L30,5 L50,5 L50,18 L70,18 L70,8 L90,8 L90,18 L100,18" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link href="/admin/orders">
          <button className="flex items-center gap-2 bg-white border border-[#c9cccf] rounded-md px-3 py-2 text-sm font-semibold shadow-sm hover:bg-[#f6f6f7]">
            <Package className="h-4 w-4 text-[#5c5f62]" />
            {ordersToFulfill} order(s) to fulfill
          </button>
        </Link>
        <Link href="/admin/orders">
          <button className="flex items-center gap-2 bg-white border border-[#c9cccf] rounded-md px-3 py-2 text-sm font-semibold shadow-sm hover:bg-[#f6f6f7]">
            <CreditCard className="h-4 w-4 text-[#5c5f62]" />
            {paymentsToCapture} payment(s) to capture
          </button>
        </Link>
      </div>

      {/* Greeting */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#202223] mb-4">Good evening, let's get started.</h2>
        
        {/* Agentic Chat Component */}
        <AdminChatAgent />

        {/* Feature Cards in Shopify Style */}
        <div className="space-y-6">
          
          {/* Recent Orders - Shopify Style */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e5] overflow-hidden">
            <div className="p-5 border-b border-[#e1e3e5] flex justify-between items-center">
              <h3 className="text-base font-semibold">Recent Orders</h3>
              <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Link href="/admin/orders">View all</Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-[#202223]">
                <thead className="bg-[#f6f6f7] border-b border-[#e1e3e5]">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold">Order</th>
                    <th className="px-5 py-2.5 font-semibold">Customer</th>
                    <th className="px-5 py-2.5 font-semibold">Date</th>
                    <th className="px-5 py-2.5 font-semibold">Payment status</th>
                    <th className="px-5 py-2.5 font-semibold">Fulfillment status</th>
                    <th className="px-5 py-2.5 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1e3e5]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#f6f6f7] transition-colors">
                      <td className="px-5 py-3 font-semibold text-blue-600 hover:underline cursor-pointer">
                        #{order.orderNumber ? order.orderNumber : order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</td>
                      <td className="px-5 py-3 text-[#5c5f62]">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(order.createdAt))}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-xs font-semibold bg-[#e4f8ec] text-[#00602a]">
                          {order.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-xs font-semibold bg-[#ffea8a] text-[#8a6116]">
                          Unfulfilled
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">{formatPrice(order.grandTotal)}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-[#5c5f62]">No recent orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products - Shopify Style */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e5] overflow-hidden">
            <div className="p-5 border-b border-[#e1e3e5]">
              <h3 className="text-base font-semibold">Top Value Products</h3>
            </div>
            <div className="divide-y divide-[#e1e3e5]">
              {topProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-[#f6f6f7] flex justify-between items-center transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white border border-[#e1e3e5] rounded-md flex items-center justify-center shadow-sm">
                      <Package className="h-5 w-5 text-[#8c9196]" />
                    </div>
                    <div>
                      <Link href={`/admin/products/${product.id}`} className="font-semibold text-[#202223] hover:underline hover:text-blue-600 block">
                        {product.name}
                      </Link>
                      <span className="text-xs text-[#5c5f62]">
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatPrice(product.price)}
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="p-8 text-center text-[#5c5f62]">No products found.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
