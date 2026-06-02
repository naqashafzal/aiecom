import Link from "next/link";
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCcw, Store, ChevronRight, Zap, User, Menu, ChevronRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { MoreToLoveClient } from "@/app/(storefront)/MoreToLoveClient";

export default async function AliExpressHome() {
  const categories = await db.category.findMany();
  
  // Fetch dynamic theme settings
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

  // Default values for settings if not set
  const heroBgColor = settings["storefront_hero_bg_color"] || "#0071FF";
  const heroCountdown = settings["storefront_hero_countdown"] || "Jun 11, 11:59 (GMT+5)";
  const heroDiscount = settings["storefront_hero_discount"] || "UP TO 80% OFF";
  const heroSideImage = settings["storefront_hero_side_image"] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500";
  
  const coupon1 = {
    title: settings["storefront_coupon_1_title"] || "US $65 OFF",
    req: settings["storefront_coupon_1_req"] || "orders US $469+",
    code: settings["storefront_coupon_1_code"] || "Code:AESS07"
  };
  const coupon2 = {
    title: settings["storefront_coupon_2_title"] || "US $24 OFF",
    req: settings["storefront_coupon_2_req"] || "orders US $169+",
    code: settings["storefront_coupon_2_code"] || "Code:AESS05"
  };
  const coupon3 = {
    title: settings["storefront_coupon_3_title"] || "US $15 OFF",
    req: settings["storefront_coupon_3_req"] || "orders US $99+",
    code: settings["storefront_coupon_3_code"] || "Code:AESS04"
  };

  const topDeal = {
    image: settings["storefront_topdeal_image"] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200",
    price: settings["storefront_topdeal_price"] || "US $2.05"
  };

  // Fetch Bestsellers
  let bestsellers = [];
  if (settings["storefront_bestsellers_category_id"]) {
    bestsellers = await db.product.findMany({
      where: { status: 'ACTIVE', categories: { some: { id: settings["storefront_bestsellers_category_id"] } } },
      take: 3, include: { images: true }, orderBy: { createdAt: 'desc' }
    });
  } else {
    bestsellers = await db.product.findMany({ where: { status: 'ACTIVE' }, take: 3, include: { images: true }, orderBy: { createdAt: 'desc' } });
  }

  // Fetch Superdeals
  let superdeals = [];
  if (settings["storefront_superdeals_category_id"]) {
    superdeals = await db.product.findMany({
      where: { status: 'ACTIVE', categories: { some: { id: settings["storefront_superdeals_category_id"] } } },
      take: 3, include: { images: true }, orderBy: { createdAt: 'desc' }
    });
  } else {
    superdeals = await db.product.findMany({ where: { status: 'ACTIVE' }, take: 3, include: { images: true }, orderBy: { createdAt: 'desc' }, skip: 3 });
  }

  // Fetch New Arrivals
  const newArrivals = await db.product.findMany({
    where: { status: 'ACTIVE' },
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });

  // Fetch More to love
  const moreToLove = await db.product.findMany({
    where: { status: 'ACTIVE' },
    take: 20,
    orderBy: { price: 'asc' }, // different sorting just to mix it up
    include: { images: true }
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      
      {/* AliExpress Style Hero Banner */}
      {settings["storefront_show_hero"] !== "false" && (
        <div style={{ backgroundColor: heroBgColor }} className="w-full relative overflow-hidden">
          <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row justify-between relative">
            
            {/* Left Content */}
            <div className="flex-1 z-10">
              <div className="text-white font-bold text-sm md:text-base mb-4 tracking-wide">
                Sale Ends: {heroCountdown}
              </div>
              <div className="flex items-center gap-4 mb-6 md:mb-10">
                <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight leading-none flex items-center gap-2">
                  {heroDiscount} 
                  <span className="bg-[#FFDD00] text-[#0071FF] rounded-full h-12 w-12 flex items-center justify-center text-3xl shrink-0 -mt-2">
                    <ChevronRight className="h-8 w-8 stroke-[4px]" />
                  </span>
                </h1>
              </div>

              {/* Coupons & Top Deals Row */}
              <div className="flex flex-wrap items-stretch gap-2">
                {[coupon1, coupon2, coupon3].map((coupon, i) => coupon.title && (
                  <Link href="/products" key={i} className="bg-white rounded-md p-3 flex flex-col items-center justify-center min-w-[140px] shadow-sm relative overflow-hidden hover:-translate-y-1 transition-transform">
                    {/* Dotted border effect on left/right for coupon look */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0071FF] -ml-1"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0071FF] -mr-1"></div>
                    
                    <span className="text-[#0071FF] font-black text-xl whitespace-nowrap">{coupon.title}</span>
                    <span className="text-[#888] text-[11px] font-medium mt-0.5 whitespace-nowrap">{coupon.req}</span>
                    <span className="text-[#0071FF] font-bold text-[12px] mt-2 whitespace-nowrap">{coupon.code}</span>
                  </Link>
                ))}
                
                {topDeal.image && (
                  <Link href="/products" className="bg-[#FEE5CD] rounded-md flex p-1 min-w-[200px] shadow-sm hover:opacity-90 transition-opacity ml-2">
                    <div className="w-[100px] bg-black rounded shrink-0 overflow-hidden relative">
                       <img src={topDeal.image} className="w-full h-full object-cover" alt="Top Deal" />
                    </div>
                    <div className="p-3 flex flex-col justify-between items-center text-center w-full">
                      <span className="text-[#B34A1B] font-bold text-sm whitespace-nowrap">Top deals</span>
                      <span className="bg-[#444] text-white text-xs font-bold px-2 py-1 rounded w-full whitespace-nowrap">{topDeal.price}</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side Image Graphic */}
            <div className="hidden lg:flex w-[450px] shrink-0 items-center justify-end z-0 right-8 absolute bottom-0 h-full">
              <img src={heroSideImage} className="max-h-[120%] object-contain object-bottom -mb-10" alt="Summer Sale Graphic" />
            </div>

          </div>
        </div>
      )}

      {/* Start Dynamic Sections */}
      <div className="w-full flex flex-col">
        
        {/* Today's Deals Section */}
        {settings["storefront_show_deals"] !== "false" && (
          <section 
            style={{
              paddingTop: settings["storefront_deals_pt"] ? `${settings["storefront_deals_pt"]}px` : '48px',
              paddingBottom: settings["storefront_deals_pb"] ? `${settings["storefront_deals_pb"]}px` : '48px',
              backgroundColor: settings["storefront_deals_bg"] || undefined,
            }}
          >
            <div className={`mx-auto px-4 lg:px-8 w-full ${settings["storefront_deals_width"] === "full" ? "max-w-none" : "max-w-[1500px]"}`}>
              <h2 className="text-3xl font-black text-center mb-8 text-[#222]">Today's deals</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
                {/* Bestsellers Box */}
                <div className="bg-white border border-gray-200 p-6 flex flex-col shadow-sm rounded-xl">
                  <div className="flex flex-col items-center text-center mb-6">
                    <h3 className="text-2xl font-bold text-[#222] mb-2">{settings["storefront_bestsellers_title"] || "Bestsellers"}</h3>
                    <span className="bg-[#FFF3E6] text-[#FF6A00] text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#FF6A00]" /> {settings["storefront_bestsellers_subtitle"] || "Top price & quality picks >"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    {bestsellers.map(product => {
                       const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";
                       const displayPrice = product.salePrice || product.price;
                       return (
                         <Link href={`/products/${product.slug}`} key={product.id} className="flex flex-col group">
                           <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden mb-3 rounded-lg">
                             <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
                    <h3 className="text-2xl font-bold text-[#222] mb-2">{settings["storefront_superdeals_title"] || "SuperDeals"}</h3>
                    <span className="bg-[#FFF0F1] text-[#E53238] text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                      <RefreshCcw className="h-4 w-4" /> {settings["storefront_superdeals_subtitle"] || "Up to 80% off >"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    {superdeals.map(product => {
                       const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";
                       const displayPrice = product.salePrice || product.price;
                       const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 10;
                       return (
                         <Link href={`/products/${product.slug}`} key={product.id} className="flex flex-col group">
                           <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden mb-3 rounded-lg">
                             <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
        )}

        {/* New Arrivals Section */}
        {settings["storefront_show_new_arrivals"] !== "false" && (
          <section 
            style={{
              paddingTop: settings["storefront_new_arrivals_pt"] ? `${settings["storefront_new_arrivals_pt"]}px` : '48px',
              paddingBottom: settings["storefront_new_arrivals_pb"] ? `${settings["storefront_new_arrivals_pb"]}px` : '48px',
              backgroundColor: settings["storefront_new_arrivals_bg"] || undefined,
            }}
          >
            <div className={`mx-auto px-4 lg:px-8 w-full ${settings["storefront_new_arrivals_width"] === "full" ? "max-w-none" : "max-w-[1500px]"}`}>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-black text-[#222]">{settings["storefront_new_arrivals_title"] || "New Arrivals"}</h2>
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
        )}

        {/* More To Love Section */}
        {settings["storefront_show_more_to_love"] !== "false" && (
          <section 
            style={{
              paddingTop: settings["storefront_more_to_love_pt"] ? `${settings["storefront_more_to_love_pt"]}px` : '48px',
              paddingBottom: settings["storefront_more_to_love_pb"] ? `${settings["storefront_more_to_love_pb"]}px` : '48px',
              backgroundColor: settings["storefront_more_to_love_bg"] || undefined,
            }}
          >
            <div className={`mx-auto px-4 lg:px-8 w-full ${settings["storefront_more_to_love_width"] === "full" ? "max-w-none" : "max-w-[1500px]"}`}>
              <MoreToLoveClient 
                initialProducts={moreToLove} 
                title={settings["storefront_more_to_love_title"] || "More to love"} 
                storeCurrency={storeCurrency} 
              />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
