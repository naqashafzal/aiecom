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

export const metadata: Metadata = {
  title: {
    default: "Aura | Premium Ecommerce",
    template: "%s | Aura",
  },
  description: "Experience the next generation of modern, fast, and engaging ecommerce. Shop premium products directly from top vendors.",
  keywords: ["ecommerce", "shopping", "premium", "electronics", "fashion"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
