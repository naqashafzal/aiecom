import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getFormatPrice } from "@/lib/format";
import Link from "next/link";
import { Package, User, LogOut, Heart, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const formatPrice = await getFormatPrice();
  
  // Fetch user orders
  const orders = await db.order.findMany({
    where: { 
      OR: [
        { userId: session.user.id },
        { email: session.user.email } // Also find guest orders that match this email
      ]
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
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-muted/30 border rounded-2xl p-6 text-center">
            <div className="h-20 w-20 bg-primary/10 text-primary rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-4">
              {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
            </div>
            <h2 className="font-bold text-lg">{session.user.name || "Customer"}</h2>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>

          <nav className="space-y-1">
            <Link href="/account" className="flex items-center justify-between p-3 rounded-lg bg-primary/10 text-primary font-medium">
              <span className="flex items-center gap-3"><Package className="h-4 w-4" /> Order History</span>
            </Link>
            <Link href="/account/addresses" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground font-medium">
              <span className="flex items-center gap-3"><MapPin className="h-4 w-4" /> Addresses</span>
            </Link>
            <Link href="/account/wishlist" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground font-medium">
              <span className="flex items-center gap-3"><Heart className="h-4 w-4" /> Wishlist</span>
            </Link>
            <Link href="/account/settings" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground font-medium">
              <span className="flex items-center gap-3"><User className="h-4 w-4" /> Account Settings</span>
            </Link>
            <form action={async () => {
              "use server";
              const { signOut } = await import("@/auth");
              await signOut();
            }}>
              <button type="submit" className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive font-medium mt-4">
                <span className="flex items-center gap-3"><LogOut className="h-4 w-4" /> Log Out</span>
              </button>
            </form>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Order History</h1>
            <p className="text-muted-foreground">View and track your recent orders.</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-muted/10 border border-dashed rounded-2xl p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">When you place an order, it will appear here.</p>
              <Button asChild rounded-full>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-background border rounded-2xl overflow-hidden shadow-sm">
                  {/* Order Header */}
                  <div className="bg-muted/30 px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Order Placed</p>
                        <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Total</p>
                        <p className="text-sm font-medium">{formatPrice(order.grandTotal)}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Order #</p>
                      <p className="text-sm font-medium">{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          {order.status === 'DELIVERED' ? 'Delivered' : 
                           order.status === 'SHIPPED' ? 'On its way' : 
                           order.status === 'PROCESSING' ? 'Processing' : 
                           'Order Confirmed'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} • Payment: {order.paymentStatus}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild className="rounded-full">
                        <Link href={`/account/orders/${order.id}`}>View Details <ChevronRight className="ml-1 h-4 w-4" /></Link>
                      </Button>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                      {order.items.map(item => (
                        <div key={item.id} className="relative h-20 w-20 shrink-0 rounded-lg bg-muted border overflow-hidden">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted">No Image</div>
                          )}
                          <span className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-background">
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
