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

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = "/favicon.ico";
  try {
    const faviconSetting = await db.setting.findUnique({ where: { key: "storeFavicon" } });
    if (faviconSetting?.value) faviconUrl = faviconSetting.value;
  } catch (e) {
    console.error("Failed to fetch favicon", e);
  }

  return {
    title: {
      default: "Aura | Premium Ecommerce",
      template: "%s | Aura",
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
      url: "https://aura-ecom.vercel.app",
      title: "Aura | Premium Ecommerce",
      description: "Experience the next generation of modern, fast, and engaging ecommerce.",
      siteName: "Aura",
    },
    twitter: {
      card: "summary_large_image",
      title: "Aura | Premium Ecommerce",
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
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
