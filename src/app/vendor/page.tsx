import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { stores: true }
  });

  const store = user?.stores[0];
  if (!store) redirect("/");

  // Get store stats
  const productsCount = await db.product.count({
    where: { storeId: store.id }
  });

  const orderStats = await db.orderItem.aggregate({
    _sum: { total: true },
    where: { storeId: store.id }
  });
  const totalSales = orderStats._sum.total || 0;

  const distinctOrders = await db.orderItem.findMany({
    where: { storeId: store.id },
    distinct: ['orderId'],
    select: { orderId: true }
  });
  const totalOrders = distinctOrders.length;

  const recentOrderItems = await db.orderItem.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { order: true, product: true }
  });

  const currencySetting = await db.setting.findUnique({ where: { key: "storeCurrency" } });
  const storeCurrency = currencySetting?.value || "USD";
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back to {store.name}'s vendor portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <h3 className="text-2xl font-bold">{formatPrice(totalSales)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Products</p>
              <h3 className="text-2xl font-bold">{productsCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Orders</p>
              <h3 className="text-2xl font-bold">{totalOrders}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Recent Store Orders</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/vendor/orders">View All</Link>
          </Button>
        </div>
        
        {recentOrderItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium text-center">Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-center">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrderItems.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-mono text-xs">{item.orderId.substring(0, 8)}...</td>
                    <td className="px-4 py-3 font-medium">{item.product.name}</td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(item.total)}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {item.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No orders yet for your store.
          </div>
        )}
      </div>
    </div>
  );
}
