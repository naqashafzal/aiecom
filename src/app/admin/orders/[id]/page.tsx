import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Truck, CreditCard, User, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      shippingAddress: true,
      items: {
        include: {
          product: true,
        }
      },
      user: true,
    }
  });

  if (!order) {
    notFound();
  }

  const orderStatuses = [
    "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"
  ];

  const paymentStatuses = [
    "PENDING", "PAID", "FAILED", "REFUNDED"
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(order.createdAt))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background rounded-xl border shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" /> Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center shrink-0 border">
                    <span className="text-xs text-muted-foreground">IMG</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product?.name || "Unknown Product"}</h4>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-medium text-sm text-right">
                    ${item.total.toFixed(2)}
                    <div className="text-xs text-muted-foreground font-normal">${item.price.toFixed(2)} each</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(order.grandTotal - order.shippingAmount - order.taxAmount + order.discountAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>${order.shippingAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total</span>
                <span>${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background rounded-xl border shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" /> Status
            </h2>
            <form action={async (formData: FormData) => {
              "use server";
              const { updateOrderStatus } = await import('@/app/admin/actions');
              await updateOrderStatus(order.id, formData);
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium mb-1">Fulfillment Status</label>
                <select 
                  name="status"
                  defaultValue={order.status} 
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  {orderStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Status</label>
                <select 
                  name="paymentStatus"
                  defaultValue={order.paymentStatus} 
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  {paymentStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" /> Customer Info
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Name</span>
                <span className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Email</span>
                <span>{order.user?.email || "Guest Checkout"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Phone</span>
                <span>{order.shippingAddress?.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" /> Shipping Address
            </h2>
            <div className="text-sm">
              <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p>{order.shippingAddress?.address1}</p>
              {order.shippingAddress?.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
