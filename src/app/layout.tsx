import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

import { auth } from "@/auth";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { getCachedSettings } from "@/lib/cache";

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = "/favicon.ico";
  let storeName = "ZS Decor";
  let fullTitle = "ZS Decor | Premium Ecommerce";

  let adSenseClientId = "";
  let customHeadScript = "";

  let defaultDescription = "Experience the next generation of modern, fast, and engaging ecommerce. Shop premium products directly from top vendors.";
  let ogImage = "";
  let twitterHandle = "";

  try {
    const settings = await getCachedSettings();

    if (settings["storeFavicon"]) faviconUrl = settings["storeFavicon"];
    
    // Global SEO Settings
    if (settings["seo_site_name"]) storeName = settings["seo_site_name"];
    else if (settings["storeName"]) storeName = settings["storeName"];
    
    fullTitle = `${storeName} | Premium Ecommerce`;
    
    if (settings["seo_default_description"]) defaultDescription = settings["seo_default_description"];
    if (settings["seo_og_image"]) ogImage = settings["seo_og_image"];
    if (settings["seo_twitter_handle"]) twitterHandle = settings["seo_twitter_handle"];

    if (settings["ad_sense_client_id"]) adSenseClientId = settings["ad_sense_client_id"];
    if (settings["ad_head_script"]) customHeadScript = settings["ad_head_script"];
  } catch (e) {
    console.error("Failed to fetch settings for metadata", e);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zsdecor-ecom.vercel.app";

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: fullTitle,
      template: `%s | ${storeName}`,
    },
    description: defaultDescription,
    keywords: ["ecommerce", "shopping", "premium", "electronics", "fashion"],
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: appUrl,
      title: fullTitle,
      description: defaultDescription,
      siteName: storeName,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: defaultDescription,
      creator: twitterHandle,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

import Script from "next/script";
import NextTopLoader from 'nextjs-toploader';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  let adSenseClientId = "";
  let customHeadScript = "";
  var defaultSlotId = "1234567890";
  let jsonLdEnabled = true;
  let storeName = "ZS Decor";

  try {
    const settings = await getCachedSettings();

    if (settings["ad_sense_client_id"]) adSenseClientId = settings["ad_sense_client_id"];
    if (settings["ad_sense_slot_id"]) defaultSlotId = settings["ad_sense_slot_id"];
    if (settings["ad_head_script"]) customHeadScript = settings["ad_head_script"];
    if (settings["seo_jsonld_enabled"]) jsonLdEnabled = settings["seo_jsonld_enabled"] === "true";
    if (settings["seo_site_name"]) storeName = settings["seo_site_name"];
    else if (settings["storeName"]) storeName = settings["storeName"];
  } catch (e) {
    console.error("Failed to fetch settings for layout", e);
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        {adSenseClientId && <meta name="adsense-client" content={adSenseClientId} />}
        {defaultSlotId && <meta name="adsense-slot" content={defaultSlotId} />}
        
        {adSenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {customHeadScript && (
          <div dangerouslySetInnerHTML={{ __html: customHeadScript }} />
        )}
        {jsonLdEnabled && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": storeName,
                "url": process.env.NEXT_PUBLIC_APP_URL || "https://zsdecor-ecom.vercel.app",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `${process.env.NEXT_PUBLIC_APP_URL || "https://zsdecor-ecom.vercel.app"}/products?query={search_term_string}`,
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#000000" showSpinner={false} shadow="0 0 10px #000000,0 0 5px #000000" />
        <Providers session={session}>
          <AnalyticsTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
