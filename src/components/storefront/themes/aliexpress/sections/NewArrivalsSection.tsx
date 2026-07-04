import Link from "next/link";
import { db } from "@/lib/prisma";

export async function NewArrivalsSection({ settings, storeCurrency = "USD" }: { settings: Record<string, any>, storeCurrency?: string }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  // Fetch New Arrivals
  const newArrivals = await db.product.findMany({
    where: { status: 'ACTIVE' },
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });

  return (
    <section 
      style={{
        paddingTop: settings["pt"] ? `${settings["pt"]}px` : '48px',
        paddingBottom: settings["pb"] ? `${settings["pb"]}px` : '48px',
        backgroundColor: settings["bg"] || undefined,
      }}
    >
      <div className={`mx-auto px-4 lg:px-8 w-full ${settings["width"] === "full" ? "max-w-none" : "max-w-[1500px]"}`}>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-black text-[#222]">{settings["title"] || "New Arrivals"}</h2>
          <Link href="/products" className="text-sm font-semibold text-[#0071FF] hover:underline ml-auto">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {newArrivals.map(product => {
          const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";
          const displayPrice = product.salePrice || product.price;
          
          return (
            <Link href={`/products/${product.slug}`} key={product.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden mb-3 rounded-lg">
                <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10">NEW</span>
                <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <h4 className="text-[13px] text-[#444] line-clamp-2 leading-snug mb-2 group-hover:underline flex-1">{product.name}</h4>
              <span className="text-[#222] font-black text-lg">{formatPrice(displayPrice)}</span>
            </Link>
          )
        })}
        </div>
      </div>
    </section>
  );
}
