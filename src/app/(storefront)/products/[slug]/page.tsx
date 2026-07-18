import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import ProductClient from "./ProductClient";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { images: true }
  });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const image = product.images?.[0]?.url || "/placeholder.png";

  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description.substring(0, 160),
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { 
      images: true,
      store: true,
      variants: true,
      categories: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, image: true } }
        }
      }
    }
  });

  if (!product) {
    return notFound();
  }

  const settingsRecords = await db.setting.findMany({
    where: {
      key: {
        in: [
          "storefront_policy_1_title",
          "storefront_policy_2_title",
          "storefront_fake_sales_enabled",
          "storeCurrency",
          "ad_product_enabled",
          "ad_product_script",
          "ad_timer_enabled",
          "ad_timer_script"
        ]
      }
    }
  });

  const settings = settingsRecords.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  const storeCurrency = settings["storeCurrency"] || "PKR";
  const displayPrice = product.salePrice || product.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.[0]?.url || "/placeholder.png",
    offers: {
      "@type": "Offer",
      priceCurrency: storeCurrency,
      price: displayPrice,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/products/${product.slug}`,
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading product...</div>}>
        <ProductClient product={product} settings={settings} />
      </Suspense>
    </>
  );
}
