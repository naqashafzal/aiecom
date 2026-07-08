import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Store, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function VendorStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const store = await db.store.findUnique({
    where: { slug },
    include: {
      owner: true,
      products: {
        where: { status: 'ACTIVE' },
        include: { images: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!store) {
    return notFound();
  }

  const currencySetting = await db.setting.findUnique({
    where: { key: "storeCurrency" }
  });
  const storeCurrency = currencySetting?.value || "USD";
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Store Banner */}
      <div className="h-64 bg-slate-900 w-full relative overflow-hidden">
        {store.banner ? (
          <Image src={store.banner} alt={store.name} fill className="object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-slate-900" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-slate-900 mb-4 shadow-xl overflow-hidden border-4 border-white/20">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="h-full w-full object-cover" />
            ) : (
              <Store className="h-8 w-8" />
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
          <p className="max-w-2xl text-slate-200">{store.description || "Welcome to our store!"}</p>
          
          <div className="flex items-center gap-6 mt-6 text-sm text-slate-300">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">{store.rating.toFixed(1)}</span> Rating
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {format(store.createdAt, "MMMM yyyy")}
            </div>
          </div>
        </div>
      </div>

      {/* Store Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">All Products from {store.name}</h2>
          <span className="text-sm text-gray-500">{store.products.length} items found</span>
        </div>

        {store.products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {store.products.map(product => {
              const primaryImage = product.images?.[0]?.url || "/placeholder.png";
              return (
                <Link key={product.id} href={`/products/${product.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all block border">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.salePrice && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                        SALE
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="font-bold text-lg text-primary">
                        {formatPrice(product.salePrice || product.price)}
                      </div>
                      {product.salePrice && (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-xl border">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
            <p className="text-gray-500 mt-1">This vendor hasn't listed any products.</p>
          </div>
        )}
      </div>
    </div>
  );
}
