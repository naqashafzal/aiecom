import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getFormatPrice } from "@/lib/format";
import Link from "next/link";
import { Package, User, LogOut, Heart, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleWishlist } from "@/app/(storefront)/wishlist-actions";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const formatPrice = await getFormatPrice();
  
  const wishlist = await db.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: { include: { images: true } } }
      }
    }
  });

  const items = wishlist?.items || [];

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
            <Link href="/account" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground font-medium">
              <span className="flex items-center gap-3"><Package className="h-4 w-4" /> Order History</span>
            </Link>
            <Link href="/account/addresses" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground font-medium">
              <span className="flex items-center gap-3"><MapPin className="h-4 w-4" /> Addresses</span>
            </Link>
            <Link href="/account/wishlist" className="flex items-center justify-between p-3 rounded-lg bg-primary/10 text-primary font-medium">
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
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">Items you've saved for later.</p>
          </div>

          {items.length === 0 ? (
            <div className="bg-muted/10 border border-dashed rounded-2xl p-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">Save items you love so you can easily find them later.</p>
              <Button asChild rounded-full>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="group relative bg-background border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                  {/* Remove Button */}
                  <form action={async () => {
                    "use server";
                    await toggleWishlist(item.productId);
                  }} className="absolute top-3 right-3 z-10">
                    <button type="submit" className="h-8 w-8 bg-background/80 backdrop-blur hover:bg-destructive hover:text-destructive-foreground text-muted-foreground rounded-full flex items-center justify-center transition-colors shadow-sm">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>

                  {/* Image */}
                  <Link href={`/products/${item.product.slug}`} className="relative aspect-square overflow-hidden bg-muted block">
                    {item.product.images[0] ? (
                      <img 
                        src={item.product.images[0].url} 
                        alt={item.product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col">
                    <Link href={`/products/${item.product.slug}`} className="flex-1">
                      <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">{item.product.name}</h3>
                    </Link>
                    <div className="mt-2 flex items-center gap-2">
                      {item.product.salePrice ? (
                        <>
                          <span className="font-bold text-red-600">{formatPrice(item.product.salePrice)}</span>
                          <span className="text-sm text-muted-foreground line-through">{formatPrice(item.product.price)}</span>
                        </>
                      ) : (
                        <span className="font-bold">{formatPrice(item.product.price)}</span>
                      )}
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
