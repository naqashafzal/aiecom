import { db } from "@/lib/prisma";
import AliExpressHome from "@/components/storefront/themes/aliexpress/AliExpressHome";
import ElegantHome from "@/components/storefront/themes/elegant/ElegantHome";
import MarketplaceHome from "@/components/storefront/themes/marketplace/MarketplaceHome";

export const revalidate = 60;

export default async function StorefrontHome() {
  const activeThemeSetting = await db.setting.findUnique({ where: { key: "storefront_active_theme" } });
  const activeTheme = activeThemeSetting?.value || "aliexpress";

  if (activeTheme === "elegant") {
    return <ElegantHome />;
  }
  
  if (activeTheme === "marketplace") {
    return <MarketplaceHome />;
  }

  return <AliExpressHome />;
}

