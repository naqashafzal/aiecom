import Link from "next/link";
import Image from "next/image";
import { Star, RefreshCcw } from "lucide-react";
import { db } from "@/lib/prisma";

export async function DealsSection({ settings, storeCurrency = "USD" }: { settings: Record<string, any>, storeCurrency?: string }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  // Fetch Bestsellers and Superdeals in parallel
  const bestsellersPromise = settings["bestsellers_category_id"]
    ? db.product.findMany({
        where: { status: 'ACTIVE', categories: { some: { id: settings["bestsellers_category_id"] } } },
        take: 3, include: { images: true }, orderBy: { createdAt: 'desc' }
      })
    : db.product.findMany({ where: { status: 'ACTIVE' }, take: 3, include: { images: true }, orderBy: { createdAt: 'desc' } });

  const superdealsPromise = settings["superdeals_category_id"]
    ? db.product.findMany({
        where: { status: 'ACTIVE', categories: { some: { id: settings["superdeals_category_id"] } } },
        take: 3, include: { images: true }, orderBy: { createdAt: 'desc' }
      })
    : db.product.findMany({ where: { status: 'ACTIVE' }, take: 3, include: { images: true }, orderBy: { createdAt: 'desc' }, skip: 3 });

  const [bestsellers, superdeals] = await Promise.all([bestsellersPromise, superdealsPromise]);

  return (
    <section 
      style={{
        paddingTop: settings["pt"] ? `${settings["pt"]}px` : '48px',
        paddingBottom: settings["pb"] ? `${settings["pb"]}px` : '48px',
        backgroundColor: settings["bg"] || undefined,
      }}
    >
      <div className={`mx-auto px-4 lg:px-8 w-full ${settings["width"] === "full" ? "max-w-none" : "max-w-[1500px]"}`}>
        <h2 className="text-3xl font-black text-center mb-8 text-[#222]">Today's deals</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
          {/* Bestsellers Box */}
          <div className="bg-white border border-gray-200 p-6 flex flex-col shadow-sm rounded-xl">
            <div className="flex flex-col items-center text-center mb-6">
              <h3 className="text-2xl font-bold text-[#222] mb-2">{settings["bestsellers_title"] || "Bestsellers"}</h3>
              <span className="bg-[#FFF3E6] text-[#FF6A00] text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                <Star className="h-4 w-4 fill-[#FF6A00]" /> {settings["bestsellers_subtitle"] || "Top price & quality picks >"}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 flex-1">
              {bestsellers.map((product: any) => {
                 const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";
                 const displayPrice = product.salePrice || product.price;
                 return (
                   <Link href={`/products/${product.slug}`} key={product.id} className="flex flex-col group">
                     <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden mb-3 rounded-lg">
                       <Image src={image} alt={product.name} fill sizes="(max-width: 768px) 33vw, 15vw" className="object-cover group-hover:scale-105 transition-transform" />
                     </div>
                     <h4 className="text-[13px] text-[#444] line-clamp-2 leading-snug mb-1 group-hover:underline">{product.name}</h4>
                     <span className="text-[#E53238] font-black text-lg mb-0.5">{formatPrice(displayPrice)}</span>
                     {product.salePrice && <span className="text-[#999] text-[11px] line-through mb-1">{formatPrice(product.price)}</span>}
                     <span className="text-[#E53238] text-[11px] font-bold flex items-center gap-1">
                       <Star className="h-3 w-3 fill-[#E53238]" /> 4.9 <span className="text-[#999] font-normal ml-1">100+ sold</span>
                     </span>
                   </Link>
                 )
              })}
            </div>
          </div>

          {/* SuperDeals Box */}
          <div className="bg-white border border-gray-200 p-6 flex flex-col shadow-sm rounded-xl">
            <div className="flex flex-col items-center text-center mb-6">
              <h3 className="text-2xl font-bold text-[#222] mb-2">{settings["superdeals_title"] || "SuperDeals"}</h3>
              <span className="bg-[#FFF0F1] text-[#E53238] text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                <RefreshCcw className="h-4 w-4" /> {settings["superdeals_subtitle"] || "Up to 80% off >"}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 flex-1">
              {superdeals.map((product: any) => {
                 const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";
                 const displayPrice = product.salePrice || product.price;
                 const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 10;
                 return (
                   <Link href={`/products/${product.slug}`} key={product.id} className="flex flex-col group">
                     <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden mb-3 rounded-lg">
                       <Image src={image} alt={product.name} fill sizes="(max-width: 768px) 33vw, 15vw" className="object-cover group-hover:scale-105 transition-transform" />
                     </div>
                     <h4 className="text-[13px] text-[#444] line-clamp-2 leading-snug mb-1 group-hover:underline">{product.name}</h4>
                     <span className="text-[#222] font-black text-lg mb-0.5">{formatPrice(displayPrice)}</span>
                     {product.salePrice && <span className="text-[#999] text-[11px] line-through mb-1">{formatPrice(product.price)}</span>}
                     <span className="bg-[#E53238] text-white text-[11px] font-black px-1.5 py-0.5 rounded-sm w-fit mt-1">
                       -{discount}%
                     </span>
                   </Link>
                 )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
