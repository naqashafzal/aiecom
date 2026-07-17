import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { Pagination } from "@/components/ui/pagination";

export default async function VendorOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { stores: true }
  });

  const store = user?.stores[0];
  if (!store) redirect("/");

  const [orderItems, total] = await Promise.all([
    db.orderItem.findMany({
      where: { storeId: store.id },
      include: {
        order: {
          include: { user: true, shippingAddress: true }
        },
        product: {
          include: { images: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    db.orderItem.count({ where: { storeId: store.id } })
  ]);
  
  const totalPages = Math.ceil(total / limit);

  const currencySetting = await db.setting.findUnique({ where: { key: "storeCurrency" } });
  const storeCurrency = currencySetting?.value || "USD";
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Orders</h1>
        <p className="text-muted-foreground mt-1">View all purchased items from your store.</p>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID / Date</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orderItems.map((item: any) => {
                const primaryImage = item.product.images[0]?.url || "/placeholder.png";
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-xs">{item.orderId.substring(0, 8).toUpperCase()}...</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.createdAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted border shrink-0">
                        <Image src={primaryImage} alt={item.product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{item.product.name}</span>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Qty: {item.quantity} x {formatPrice(item.price)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      <div className="font-medium text-foreground">{item.order.user?.name || item.order.shippingAddress?.firstName + " " + item.order.shippingAddress?.lastName}</div>
                      <div className="text-xs">{item.order.shippingAddress?.city}, {item.order.shippingAddress?.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                        item.order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                        item.order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-right text-foreground">
                      {formatPrice(item.total)}
                    </td>
                  </tr>
                );
              })}
              {orderItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No orders yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t">
          <Pagination totalPages={totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  );
}
