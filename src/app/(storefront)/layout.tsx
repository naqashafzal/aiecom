import { AliExpressNavbar } from "@/components/storefront/themes/aliexpress/AliExpressNavbar";
import { ElegantNavbar } from "@/components/storefront/themes/elegant/ElegantNavbar";
import { MarketplaceNavbar } from "@/components/storefront/themes/marketplace/MarketplaceNavbar";
import { Footer } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { AiChat } from "@/components/storefront/ai-chat";
import { CurrencyProvider } from "@/components/storefront/currency-provider";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const aiSetting = await db.setting.findUnique({ where: { key: "aiAgentEnabled" } });
  const aiEnabled = aiSetting?.value !== "false"; // Default to true if not set

  const currencySetting = await db.setting.findUnique({ where: { key: "storeCurrency" } });
  const storeCurrency = currencySetting?.value || "USD";

  const menuSetting = await db.setting.findUnique({ where: { key: "storefront_main_menu" } });
  let menuLinks = [];
  try {
    if (menuSetting?.value) {
      menuLinks = JSON.parse(menuSetting.value);
    } else {
      menuLinks = [
        { name: "Bundle deals", url: "/products", highlight: true },
        { name: "Choice", url: "/products" },
        { name: "Automotive", url: "/products" },
        { name: "Appliances", url: "/products" },
      ];
    }
  } catch (e) {
    console.error("Failed to parse menu settings", e);
  }

  const themeSetting = await db.setting.findUnique({ where: { key: "storefront_active_theme" } });
  const activeTheme = themeSetting?.value || "aliexpress";

  const allSettings = await db.setting.findMany({
    where: { key: { startsWith: "storefront_" } }
  });
  
  const settingsMap = allSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const primaryColor = settingsMap["storefront_primary_color"];
  const bgColor = settingsMap["storefront_bg_color"];
  const textColor = settingsMap["storefront_text_color"];
  const borderRadius = settingsMap["storefront_border_radius"];
  const customCss = settingsMap["storefront_custom_css"];
  const gaId = settingsMap["storefront_ga_id"];
  const fontFamilySetting = settingsMap["storefront_font_family"] || "sans";

  let fontClass = "font-sans";
  if (fontFamilySetting === "serif") fontClass = "font-serif";
  if (fontFamilySetting === "mono") fontClass = "font-mono";

  // Build dynamic CSS to override common theme hardcoded values
  const dynamicCss = `
    :root {
      ${primaryColor ? `--primary-color: ${primaryColor};` : ''}
      ${bgColor ? `--bg-color: ${bgColor};` : ''}
      ${textColor ? `--text-color: ${textColor};` : ''}
      ${borderRadius ? `--border-radius: ${borderRadius};` : ''}
    }
    
    ${primaryColor ? `
      /* AliExpress Primary */
      .bg-\\[\\#0071FF\\] { background-color: var(--primary-color) !important; }
      .text-\\[\\#0071FF\\] { color: var(--primary-color) !important; }
      .border-\\[\\#0071FF\\] { border-color: var(--primary-color) !important; }
      
      /* AliExpress Red/Accent */
      .bg-\\[\\#E53238\\] { background-color: var(--primary-color) !important; }
      .text-\\[\\#E53238\\] { color: var(--primary-color) !important; }
      
      /* Elegant Gold */
      .bg-\\[\\#D4AF37\\] { background-color: var(--primary-color) !important; }
      .text-\\[\\#D4AF37\\] { color: var(--primary-color) !important; }
      .border-\\[\\#D4AF37\\] { border-color: var(--primary-color) !important; }
    ` : ''}

    ${bgColor ? `
      body, .min-h-screen { background-color: var(--bg-color) !important; }
    ` : ''}

    ${textColor ? `
      body, .min-h-screen { color: var(--text-color) !important; }
      h1, h2, h3, h4, p, span { color: inherit; }
    ` : ''}

    ${borderRadius ? `
      * { border-radius: var(--border-radius) !important; }
    ` : ''}
    
    ${customCss || ''}
  `;

  const logoUrl = settingsMap["storefront_logo_url"];
  const logoText = settingsMap["storefront_logo_text"];
  const logoHeight = parseInt(settingsMap["storefront_logo_height"] || "40", 10);
  const logoAccent = settingsMap["storefront_logo_accent"];

  const logoProps = { logoUrl, logoText, logoHeight, logoAccent };

  return (
    <div className={`flex flex-col min-h-screen ${fontClass}`}>
      <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />
      {gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');` }}></script>
        </>
      )}
      <CurrencyProvider currencyCode={storeCurrency}>
        {activeTheme === "elegant" ? <ElegantNavbar menuLinks={menuLinks} {...logoProps} /> : activeTheme === "marketplace" ? <MarketplaceNavbar menuLinks={menuLinks} {...logoProps} /> : <AliExpressNavbar menuLinks={menuLinks} {...logoProps} />}
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <Footer />
        {aiEnabled && <AiChat />}
      </CurrencyProvider>
    </div>
  );
}
