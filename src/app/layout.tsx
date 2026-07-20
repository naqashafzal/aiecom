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

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = "/favicon.ico";
  let storeName = "ZS Decor";
  let fullTitle = "ZS Decor | Premium Ecommerce";

  try {
    const allSettings = await db.setting.findMany({
      where: { key: { in: ["storeFavicon", "storeName"] } }
    });
    
    const faviconSetting = allSettings.find(s => s.key === "storeFavicon");
    const nameSetting = allSettings.find(s => s.key === "storeName");

    if (faviconSetting?.value) faviconUrl = faviconSetting.value;
    if (nameSetting?.value) {
      storeName = nameSetting.value;
      fullTitle = `${storeName} | Premium Ecommerce`;
    }
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers session={session}>
          <AnalyticsTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
