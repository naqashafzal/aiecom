import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/prisma";
import { defaultElegantConfig, ThemeConfig } from "@/lib/themeSchemas";
import { MoreToLoveClient } from "@/app/(storefront)/MoreToLoveClient";
import { CustomBuilderSection } from "../aliexpress/sections/CustomBuilderSection";
import { getCachedLatestProducts } from "@/lib/cache";
import { getCachedCategories } from "@/lib/cache";

// 1. Elegant Hero Section
function ElegantHeroSection({ settings }: { settings: Record<string, any> }) {
  const heroImage = settings["image"] || "/placeholder.png";
  const heroTitle = settings["title"] || "LAMPS BY YZ";

  return (
    <div className="w-full h-[60vh] md:h-[80vh] relative mb-20">
      <Image src={heroImage} fill className="object-cover" alt="Hero" priority />
      <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white text-center px-4">
        <h2 className="text-4xl md:text-7xl font-serif tracking-widest uppercase mb-8">{heroTitle}</h2>
        <Link href="/products" className="bg-white text-black px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors">
          Shop Now
        </Link>
      </div>
    </div>
  );
}

// 2. Elegant Categories Section
function ElegantCategoriesSection({ settings, categories }: { settings: Record<string, any>, categories: any[] }) {
  const title = settings["title"] || "TOP CATEGORY";
  const subtitle = settings["subtitle"] || "Most Viewed Categories with Affordable Prices";

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center justify-center w-full max-w-4xl mb-2">
          <div className="flex-1 h-px bg-gray-300"></div>
          <h2 className="text-2xl md:text-3xl font-black uppercase mx-6 tracking-wider">
            {title}
          </h2>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
        {categories.map((cat, i) => {
          const image = cat.imageId || "/placeholder.png";
          return (
            <Link href={`/products?category=${cat.slug}`} key={cat.id} className="flex flex-col items-center group">
              <div className="w-full aspect-square bg-[#F5F5F5] overflow-hidden mb-3 relative">
                <Image 
                  src={image} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={cat.name} 
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </div>
              <span className="text-sm text-gray-800 text-center">{cat.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  );
}

// 3. Elegant Best Sellers
function ElegantBestSellersSection({ settings, products, formatPrice }: { settings: Record<string, any>, products: any[], formatPrice: (p: number) => string }) {
  const title = settings["title"] || "BEST SELLERS";

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
      <section className="mb-24">
        <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 tracking-widest uppercase">
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => {
            const image = product.images?.[0]?.url || "/placeholder.png";
            const displayPrice = product.salePrice || product.price;
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col">
                <div className="relative aspect-[4/5] bg-[#F5F5F5] overflow-hidden mb-4">
                  {product.salePrice && (
                    <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold px-2 py-1 z-10 tracking-widest uppercase">
                      Sale
                    </span>
                  )}
                  <Image src={image} fill className="object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <h4 className="text-sm text-black font-medium tracking-wide uppercase mb-1">{product.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{formatPrice(displayPrice)}</span>
                  {product.salePrice && <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>}
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-12 text-center">
          <Link href="/products" className="inline-block border border-black text-black px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors">
            View All
          </Link>
        </div>
      </section>
    </div>
  );
}


// MAIN ENTRY
export default async function ElegantHome() {
  const allCategories = await getCachedCategories();
  
  const configSetting = await db.setting.findUnique({
    where: { key: "storefront_theme_config_elegant" }
  });

  const currencySetting = await db.setting.findUnique({
    where: { key: "storeCurrency" }
  });

  let themeConfig: ThemeConfig = defaultElegantConfig;
  if (configSetting?.value) {
    try {
      themeConfig = JSON.parse(configSetting.value);
    } catch (e) {
      console.error("Failed to parse elegant config", e);
    }
  }

  const storeCurrency = currencySetting?.value || "USD";
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  const products = await getCachedLatestProducts(24);
  const bestSellers = products.slice(0, 4);
  const allProducts = products.slice(4);

  const renderSection = (id: string) => {
    const section = themeConfig.sections[id];
    if (!section) return null;

    if (section.settings["hidden"] === true || section.settings["hidden"] === "true") return null;

    switch (section.type) {
      case "elegant_hero":
        return <ElegantHeroSection key={id} settings={section.settings} />;
      case "elegant_categories":
        return <ElegantCategoriesSection key={id} settings={section.settings} categories={allCategories} />;
      case "elegant_best_sellers":
        return <ElegantBestSellersSection key={id} settings={section.settings} products={bestSellers} formatPrice={formatPrice} />;
      case "custom_builder":
        return <CustomBuilderSection key={id} settings={section.settings} block_order={section.block_order} blocks={section.blocks} storeCurrency={storeCurrency} />;
      default:
        return <div key={id} className="p-4 text-center text-red-500">Unknown section type: {section.type}</div>;
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      
      {/* Dynamic Sections */}
      {themeConfig.order.map((id) => renderSection(id))}

      {/* Infinite Scroll Products using MoreToLoveClient */}
      <div className="bg-[#fcfcfc] py-20 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <MoreToLoveClient 
            initialProducts={allProducts} 
            title="All Products"
            storeCurrency={storeCurrency} 
          />
        </div>
      </div>

    </div>
  );
}
