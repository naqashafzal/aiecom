import Link from "next/link";
import Image from "next/image";
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
        {newArrivals.map((product: any) => {
          const image = product.images?.[0]?.url || "/placeholder.png";
          const displayPrice = product.salePrice || product.price;
          
          return (
            <Link href={`/products/${product.slug}`} key={product.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden group mb-3 rounded-lg">
                <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-30">NEW</span>
                {product.videoUrl ? (
                  <>
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center bg-black">
                      {(() => {
                        const url = product.videoUrl;
                        if (url.includes("youtube.com") || url.includes("youtu.be")) {
                          return <iframe src={url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/") + "?autoplay=1&mute=1&controls=0&loop=1"} className="w-full h-full scale-[1.35]" allowFullScreen />;
                        }
                        if (url.includes("tiktok.com")) {
                          const match = url.match(/video\/(\d+)/);
                          return <iframe src={match ? `https://www.tiktok.com/embed/v2/${match[1]}` : url} className="w-full h-full scale-[1.1]" allowFullScreen />;
                        }
                        if (url.includes("facebook.com") || url.includes("fb.watch")) {
                          return <iframe src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`} className="w-full h-full" style={{ border: "none", overflow: "hidden" }} allowFullScreen />;
                        }
                        return <video src={url} autoPlay muted loop playsInline className="w-full h-full object-cover" />;
                      })()}
                    </div>
                    <div className="absolute inset-0 z-20" />
                  </>
                ) : (
                  <Image src={image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
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
