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

  try {
    const settings = await getCachedSettings();

    if (settings["storeFavicon"]) faviconUrl = settings["storeFavicon"];
    if (settings["storeName"]) {
      storeName = settings["storeName"];
      fullTitle = `${storeName} | Premium Ecommerce`;
    }
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
    description: "Experience the next generation of modern, fast, and engaging ecommerce. Shop premium products directly from top vendors.",
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
      description: "Experience the next generation of modern, fast, and engaging ecommerce.",
      siteName: storeName,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: "Experience the next generation of modern, fast, and engaging ecommerce.",
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

  try {
    const settings = await getCachedSettings();

    if (settings["ad_sense_client_id"]) adSenseClientId = settings["ad_sense_client_id"];
    if (settings["ad_sense_slot_id"]) defaultSlotId = settings["ad_sense_slot_id"];
    if (settings["ad_head_script"]) customHeadScript = settings["ad_head_script"];
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
