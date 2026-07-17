import { db } from "@/lib/prisma";
import { defaultAliExpressConfig, ThemeConfig } from "@/lib/themeSchemas";
import { HeroSection } from "./sections/HeroSection";
import { DealsSection } from "./sections/DealsSection";
import { NewArrivalsSection } from "./sections/NewArrivalsSection";
import { MoreToLoveSection } from "./sections/MoreToLoveSection";
import { CustomBuilderSection } from "./sections/CustomBuilderSection";

export default async function AliExpressHome() {
  // Fetch dynamic theme config and currency in parallel
  const [configSetting, currencySetting] = await Promise.all([
    db.setting.findUnique({ where: { key: "storefront_theme_config_aliexpress" } }),
    db.setting.findUnique({ where: { key: "storeCurrency" } })
  ]);

  const storeCurrency = currencySetting?.value || "USD";

  let themeConfig: ThemeConfig = defaultAliExpressConfig;
  
  if (configSetting?.value) {
    try {
      themeConfig = JSON.parse(configSetting.value);
    } catch (e) {
      console.error("Failed to parse theme config, using default", e);
    }
  }
  
  const renderSection = (id: string) => {
    const section = themeConfig.sections[id];
    if (!section) return null;

    if (section.settings["hidden"] === true || section.settings["hidden"] === "true") return null;

    switch (section.type) {
      case "hero":
        return <HeroSection key={id} settings={section.settings} block_order={section.block_order} blocks={section.blocks} />;
      case "deals":
        return <DealsSection key={id} settings={section.settings} storeCurrency={storeCurrency} />;
      case "new_arrivals":
        return <NewArrivalsSection key={id} settings={section.settings} storeCurrency={storeCurrency} />;
      case "more_to_love":
        return <MoreToLoveSection key={id} settings={section.settings} storeCurrency={storeCurrency} />;
      case "custom_builder":
        return <CustomBuilderSection key={id} settings={section.settings} block_order={section.block_order} blocks={section.blocks} storeCurrency={storeCurrency} />;
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
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <div className="w-full flex flex-col">
        {themeConfig.order?.map((id) => renderSection(id))}
      </div>
    </div>
  );
}
