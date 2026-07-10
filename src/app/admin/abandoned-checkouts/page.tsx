import { db } from "@/lib/prisma";
import Link from "next/link";
import { ShoppingCart, Mail, Clock, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFormatPrice } from "@/lib/format";
import { sendAbandonedCartEmail } from "./actions";

export default async function AdminAbandonedCheckoutsPage() {
  const formatPrice = await getFormatPrice();
  
  // Fetch all pending orders that have an email (abandoned carts)
  const abandonedCarts = await db.order.findMany({
    where: { 
      status: "PENDING",
      email: { not: null }
    },
    include: {
      items: {
        include: { 
          product: {
            include: { images: true }
          } 
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Abandoned Checkouts</h1>
          <p className="text-muted-foreground mt-1">Customers who added items to their cart but did not complete payment.</p>
        </div>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Recovery Status</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {abandonedCarts.map((cart) => (
                <tr key={cart.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium">{new Date(cart.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(cart.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-primary">{cart.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {cart.items.slice(0, 3).map((item, i) => (
                        <div key={item.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-muted overflow-hidden relative">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0].url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs">?</span>
                          )}
                        </div>
                      ))}
                      {cart.items.length > 3 && (
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-background bg-muted text-xs font-medium">
                          +{cart.items.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider bg-yellow-100 text-yellow-800">
                      Not Sent
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    {formatPrice(cart.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={async () => {
                      "use server";
                      await sendAbandonedCartEmail(cart.id);
                    }}>
                      <Button size="sm" type="submit" className="whitespace-nowrap">
                        <Mail className="mr-2 h-4 w-4" /> Send Email
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
              {abandonedCarts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No abandoned checkouts</h3>
                    <p className="mt-1 text-sm text-muted-foreground">When customers leave during checkout, they will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
