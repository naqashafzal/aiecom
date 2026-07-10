import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/prisma";
import { defaultElegantConfig, ThemeConfig } from "@/lib/themeSchemas";
import { MoreToLoveClient } from "@/app/(storefront)/MoreToLoveClient";
import { CustomBuilderSection } from "../aliexpress/sections/CustomBuilderSection";
import { getCachedLatestProducts } from "@/lib/cache";
import { getCachedCategories } from "@/lib/cache";

import { 
  ElegantHeroSection, 
  ElegantCategoriesSection, 
  ElegantBestSellersSection 
} from "./ElegantSectionsClient";


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
        return <ElegantBestSellersSection key={id} settings={section.settings} products={bestSellers} storeCurrency={storeCurrency} />;
      case "custom_builder":
        return <CustomBuilderSection key={id} settings={section.settings} block_order={section.block_order} blocks={section.blocks} storeCurrency={storeCurrency} />;
      default:
        return <div key={id} className="p-4 text-center text-red-500">Unknown section type: {section.type}</div>;
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      
      {/* Dynamic Sections */}
      {themeConfig.order?.map((id) => renderSection(id))}

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
