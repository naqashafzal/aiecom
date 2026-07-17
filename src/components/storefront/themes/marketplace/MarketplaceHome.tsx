import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/prisma";
import { ChevronRight, Clock } from "lucide-react";
import { MoreToLoveClient } from "@/app/(storefront)/MoreToLoveClient";
import { defaultMarketplaceConfig, ThemeConfig } from "@/lib/themeSchemas";
import { CustomBuilderSection } from "../aliexpress/sections/CustomBuilderSection";
import { getCachedLatestProducts, getCachedFlashSaleProducts, getCachedActiveProducts } from "@/lib/cache";

// 1a. Marketplace Sidebar (Vertical Menu)
function MarketplaceSidebar({ settings, blocks = {}, block_order = [], categories }: { settings: Record<string, any>, blocks?: Record<string, any>, block_order?: string[], categories: any[] }) {
  const sidebarTitle = settings["title"] || "Categories";
  
  let sidebarLinks: {name: string, url: string}[] = [];
  
  if (block_order.length > 0) {
    sidebarLinks = block_order.map(id => {
      const b = blocks[id];
      if (!b || b.type !== "category_link") return null;
      const cat = categories.find(c => c.id === b.settings["category_id"]);
      const name = b.settings["custom_text"] || cat?.name || "Unknown Category";
      const url = cat ? `/products?category=${cat.id}` : "#";
      return { name, url };
    }).filter(Boolean) as {name: string, url: string}[];
  } else {
    sidebarLinks = categories.map(c => ({ name: c.name, url: `/products?category=${c.id}` }));
  }

  return (
    <div className="w-[240px] bg-white rounded-md shadow-sm hidden lg:block overflow-hidden shrink-0">
      <div className="bg-gray-50 px-4 py-3 border-b font-bold text-sm text-gray-800">
        {sidebarTitle}
      </div>
      <ul className="py-2 text-sm overflow-y-auto max-h-[340px]">
        {sidebarLinks.map((link: any, i: number) => (
          <li key={i}>
            <Link href={link.url || "#"} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700 hover:text-[#f85606]">
              <span className="truncate pr-2">{link.name}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 1b. Marketplace Hero
function MarketplaceHero({ settings }: { settings: Record<string, any> }) {
  const heroImage = settings["image"] || "/placeholder.png";
  const title = settings["title"] || "Biggest Sale of the Year";
  const subtitle = settings["subtitle"] || "Up to 80% off on all electronics and fashion items!";
  const buttonText = settings["buttonText"] || "SHOP NOW";
  const buttonLink = settings["buttonLink"] || "/products";

  return (
    <div className="flex-1 bg-white rounded-md shadow-sm overflow-hidden relative min-h-[200px] md:min-h-[380px]">
      <Image src={heroImage} fill className="object-cover" alt="Marketplace Hero" priority />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center p-8 md:p-12">
        <div className="text-white max-w-md">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">{title}</h1>
          <p className="text-lg md:text-xl mb-6 drop-shadow-md">{subtitle}</p>
          <Link href={buttonLink} className="bg-[#f85606] text-white px-8 py-3 rounded font-bold hover:bg-[#e04a00] transition-colors inline-block">
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}

// 2. Flash Sales
function MarketplaceFlashSales({ settings, deals, formatPrice }: { settings: Record<string, any>, deals: any[], formatPrice: (p: number) => string }) {
  const title = settings["title"] || "Flash Sales";
  return (
    <div className="max-w-[1200px] mx-auto px-4 mb-8">
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#f85606]">{title}</h2>
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
            const image = product.images?.[0]?.url || "/placeholder.png";
            const price = product.salePrice || product.price;
            const oldPrice = product.salePrice ? product.price : (product.price * 1.2); 
            const discount = Math.round(((oldPrice - price) / oldPrice) * 100);

            return (
              <Link href={`/products/${product.slug}`} key={product.id} className="group flex flex-col hover:shadow-lg transition-shadow p-2 rounded">
                <div className="w-full aspect-square bg-gray-50 rounded mb-2 overflow-hidden relative">
                  <Image src={image} fill className="object-cover group-hover:scale-105 transition-transform duration-300" alt={product.name} sizes="(max-width: 768px) 50vw, 16vw" />
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
    </div>
  );
}

// 3. Official Stores
function MarketplaceOfficialStores({ settings, officialStores }: { settings: Record<string, any>, officialStores: any[] }) {
  const title = settings["title"] || "Official Stores";
  if (officialStores.length === 0) return null;
  
  return (
    <div className="max-w-[1200px] mx-auto px-4 mb-8">
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {officialStores.map((store, i) => (
            <Link href="#" key={store.id} className="flex flex-col items-center group">
              <div className="w-full aspect-square rounded-full bg-gray-50 border border-gray-100 overflow-hidden mb-3 p-2 shadow-sm group-hover:shadow-md transition-shadow">
                <Image 
                  src={store.logo || "/placeholder.png"} 
                  width={200}
                  height={200}
                  className="w-full h-full object-contain rounded-full" 
                  alt={store.name} 
                />
              </div>
              <span className="text-sm font-medium text-gray-800 text-center">{store.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// MAIN ENTRY
export default async function MarketplaceHome() {
  const categories = await db.category.findMany();
  
  const configSetting = await db.setting.findUnique({
    where: { key: "storefront_theme_config_marketplace" }
  });

  const currencySetting = await db.setting.findUnique({
    where: { key: "storeCurrency" }
  });

  let themeConfig: ThemeConfig = defaultMarketplaceConfig;
  if (configSetting?.value) {
    try {
      themeConfig = JSON.parse(configSetting.value);
    } catch (e) {
      console.error("Failed to parse marketplace config", e);
    }
  }

  const storeCurrency = currencySetting?.value || "USD";
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  const flashSaleProducts = await getCachedFlashSaleProducts(6);
  const deals = flashSaleProducts.length > 0 ? flashSaleProducts : await getCachedActiveProducts(6);
  const officialStores = await db.store.findMany({ take: 6 });
  const allProducts = await getCachedLatestProducts(24);

  const renderSection = (id: string) => {
    const section = themeConfig.sections[id];
    if (!section) return null;

    if (section.settings["hidden"] === true || section.settings["hidden"] === "true") return null;

    switch (section.type) {
      case "marketplace_sidebar":
      case "marketplace_hero":
        return null; // Handled specially in the main loop
      case "marketplace_flash_sales":
        return <MarketplaceFlashSales key={id} settings={section.settings} deals={deals} formatPrice={formatPrice} />;
      case "marketplace_official_stores":
        return <MarketplaceOfficialStores key={id} settings={section.settings} officialStores={officialStores} />;
      case "marketplace_just_for_you":
        return (
          <div key={id} className="max-w-[1200px] mx-auto px-4 mb-8">
            <div className="flex items-center justify-center my-8">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h2 className="text-2xl text-gray-600 font-light mx-6 uppercase tracking-wider">
                {section.settings["title"] || "Just For You"}
              </h2>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            <MoreToLoveClient initialProducts={allProducts} storeCurrency={storeCurrency} title="" />
          </div>
        );
      case "custom_builder":
        return (
           <div key={id} className="max-w-[1200px] mx-auto mb-8">
             <CustomBuilderSection settings={section.settings} block_order={section.block_order} blocks={section.blocks} storeCurrency={storeCurrency} />
           </div>
        );
      case "custom_html":
        return (
          <div 
            key={id} 
            className={`w-full ${section.settings.width === "container" ? "max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8" : ""}`}
            style={{
              backgroundColor: section.settings.bg || "transparent",
              paddingTop: `${section.settings.pt || 48}px`,
              paddingBottom: `${section.settings.pb || 48}px`,
            }}
            dangerouslySetInnerHTML={{ __html: section.settings.html_content || "<div>Custom HTML</div>" }}
          />
        );
      default:
        return <div key={id} className="p-4 text-center text-red-500">Unknown section type: {section.type}</div>;
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-12 font-sans text-[#333]">
      {/* Dynamic Sections */}
      <div className="flex flex-col w-full">
        {(() => {
          const renderedSections = [];
          const orderLength = themeConfig.order?.length || 0;
          for (let i = 0; i < orderLength; i++) {
            const id = themeConfig.order[i];
            const section = themeConfig.sections[id];
            if (!section || section.settings["hidden"]) continue;

            if (section.type === "marketplace_sidebar" || section.type === "marketplace_hero") {
              const nextId = themeConfig.order[i+1];
              const nextSection = nextId ? themeConfig.sections[nextId] : null;

              if (
                nextSection && !nextSection.settings["hidden"] &&
                ((section.type === "marketplace_sidebar" && nextSection.type === "marketplace_hero") ||
                (section.type === "marketplace_hero" && nextSection.type === "marketplace_sidebar"))
              ) {
                const sidebar = section.type === "marketplace_sidebar" ? section : nextSection;
                const hero = section.type === "marketplace_hero" ? section : nextSection;
                
                renderedSections.push(
                  <div key={`${id}-${nextId}`} className="max-w-[1200px] mx-auto px-4 pt-4 md:pt-6 mb-8 flex gap-4 w-full">
                    {section.type === "marketplace_sidebar" ? (
                      <>
                        <MarketplaceSidebar settings={sidebar.settings} blocks={sidebar.blocks} block_order={sidebar.block_order} categories={categories} />
                        <MarketplaceHero settings={hero.settings} />
                      </>
                    ) : (
                      <>
                        <MarketplaceHero settings={hero.settings} />
                        <MarketplaceSidebar settings={sidebar.settings} blocks={sidebar.blocks} block_order={sidebar.block_order} categories={categories} />
                      </>
                    )}
                  </div>
                );
                i++; // skip next
                continue;
              } else {
                renderedSections.push(
                  <div key={id} className="max-w-[1200px] mx-auto px-4 pt-4 md:pt-6 mb-8 flex gap-4 w-full">
                    {section.type === "marketplace_sidebar" 
                      ? <MarketplaceSidebar settings={section.settings} blocks={section.blocks} block_order={section.block_order} categories={categories} />
                      : <MarketplaceHero settings={section.settings} />
                    }
                  </div>
                );
                continue;
              }
            }

            renderedSections.push(renderSection(id));
          }
          return renderedSections;
        })()}
      </div>
    </div>
  );
}
