import Link from "next/link";
import { db } from "@/lib/prisma";
import { ChevronRight, Star, Clock } from "lucide-react";
import { MoreToLoveClient } from "@/app/(storefront)/MoreToLoveClient";

export default async function MarketplaceHome() {
  const categories = await db.category.findMany({ take: 12 });
  
  const settingsRecords = await db.setting.findMany({
    where: {
      OR: [
        { key: { startsWith: "storefront_" } },
        { key: "storeCurrency" }
      ]
    }
  });

  const settings = settingsRecords.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  const storeCurrency = settings["storeCurrency"] || "USD";
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  const heroImage = settings["storefront_marketplace_hero_image"] || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000";

  // Fetch data
  const flashSaleProducts = await db.product.findMany({ 
    where: { status: 'ACTIVE', salePrice: { not: null } }, 
    take: 6, 
    include: { images: true } 
  });
  
  // If no flash sales, fallback to regular products
  const deals = flashSaleProducts.length > 0 ? flashSaleProducts : await db.product.findMany({ 
    where: { status: 'ACTIVE' }, 
    take: 6, 
    include: { images: true } 
  });

  const officialStores = await db.store.findMany({ take: 6 });
  const allProducts = await db.product.findMany({ 
    where: { status: 'ACTIVE' }, 
    take: 24, 
    include: { images: true }, 
    orderBy: { createdAt: 'desc' } 
  });

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-12 font-sans text-[#333]">
      
      {/* Top Section: Sidebar + Hero */}
      <div className="max-w-[1200px] mx-auto px-4 pt-4 md:pt-6 mb-8 flex gap-4">
        {/* Left Categories Sidebar (Desktop only) */}
        <div className="w-[240px] bg-white rounded-md shadow-sm hidden lg:block overflow-hidden shrink-0">
          <div className="bg-gray-50 px-4 py-3 border-b font-bold text-sm text-gray-800">
            Categories
          </div>
          <ul className="py-2 text-sm">
            {categories.map((cat, i) => (
              <li key={cat.id}>
                <Link href={`/products`} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700 hover:text-[#f85606]">
                  <span className="truncate pr-2">{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hero Carousel Space */}
        <div className="flex-1 bg-white rounded-md shadow-sm overflow-hidden relative min-h-[200px] md:min-h-[380px]">
          <img src={heroImage} className="w-full h-full object-cover" alt="Marketplace Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center p-8 md:p-12">
            <div className="text-white max-w-md">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">Biggest Sale of the Year</h1>
              <p className="text-lg md:text-xl mb-6 drop-shadow-md">Up to 80% off on all electronics and fashion items!</p>
              <Link href="/products" className="bg-[#f85606] text-white px-8 py-3 rounded font-bold hover:bg-[#e04a00] transition-colors inline-block">
                SHOP NOW
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 space-y-8">
        
        {/* Flash Sales */}
        {settings["storefront_show_marketplace_flash_sales"] !== "false" && (
          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-[#f85606]">
                  {settings["storefront_marketplace_flash_title"] || "Flash Sales"}
                </h2>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Clock className="w-4 h-4" /> Ending in <span className="bg-[#f85606] text-white px-2 py-0.5 rounded">12</span> : <span className="bg-[#f85606] text-white px-2 py-0.5 rounded">45</span> : <span className="bg-[#f85606] text-white px-2 py-0.5 rounded">30</span>
                </div>
              </div>
              <Link href="/products" className="text-[#f85606] text-sm font-medium border border-[#f85606] px-4 py-1 rounded hover:bg-[#f85606] hover:text-white transition-colors">
                SEE MORE
              </Link>
            </div>
            <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {deals.map(product => {
                const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300";
                const price = product.salePrice || product.price;
                const oldPrice = product.salePrice ? product.price : (product.price * 1.2); // mock old price if none
                const discount = Math.round(((oldPrice - price) / oldPrice) * 100);

                return (
                  <Link href={`/products/${product.slug}`} key={product.id} className="group flex flex-col hover:shadow-lg transition-shadow p-2 rounded">
                    <div className="w-full aspect-square bg-gray-50 rounded mb-2 overflow-hidden relative">
                      <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={product.name} />
                      <span className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-1.5 py-0.5 text-[#f85606] rounded-bl-lg">
                        -{discount}%
                      </span>
                    </div>
                    <h3 className="text-sm text-gray-800 line-clamp-2 mb-1 h-10">{product.name}</h3>
                    <div className="text-[#f85606] font-bold text-lg">{formatPrice(price)}</div>
                    <div className="text-gray-400 text-xs line-through">{formatPrice(oldPrice)}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Official Stores */}
        {settings["storefront_show_marketplace_official_stores"] !== "false" && officialStores.length > 0 && (
          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                {settings["storefront_marketplace_stores_title"] || "Official Stores"}
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {officialStores.map((store, i) => (
                <Link href="#" key={store.id} className="flex flex-col items-center group">
                  <div className="w-full aspect-square rounded-full bg-gray-50 border border-gray-100 overflow-hidden mb-3 p-2 shadow-sm group-hover:shadow-md transition-shadow">
                    <img 
                      src={store.logo || `https://images.unsplash.com/photo-${1500000000100 + i}?q=80&w=200`} 
                      className="w-full h-full object-contain rounded-full" 
                      alt={store.name} 
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center">{store.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Just For You (Infinite Scroll grid) */}
        {settings["storefront_show_marketplace_just_for_you"] !== "false" && (
          <div>
            <div className="flex items-center justify-center my-8">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h2 className="text-2xl text-gray-600 font-light mx-6 uppercase tracking-wider">
                {settings["storefront_marketplace_foryou_title"] || "Just For You"}
              </h2>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            <MoreToLoveClient initialProducts={allProducts} storeCurrency={storeCurrency} title="" />
          </div>
        )}

      </div>
    </div>
  );
}
