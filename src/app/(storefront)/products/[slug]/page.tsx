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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zsdecor-ecom.vercel.app";
  const cleanDescription = product.description.replace(/<[^>]*>?/gm, '').substring(0, 160).trim() + '...';

  return {
    title: product.name,
    description: cleanDescription,
    alternates: {
      canonical: `${appUrl}/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: cleanDescription,
      images: [image],
      url: `${appUrl}/products/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: cleanDescription,
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zsdecor-ecom.vercel.app';
  
  const productJsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.replace(/<[^>]*>?/gm, ''),
    image: product.images && product.images.length > 0 ? product.images.map(img => img.url) : ["/placeholder.png"],
    sku: (product as any).sku || product.id,
    mpn: (product as any).sku || product.id,
    brand: { "@type": "Brand", name: settings["storeName"] || "ZS Decor" },
    itemCondition: "https://schema.org/NewCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: storeCurrency,
      price: displayPrice,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${appUrl}/products/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: settings["storeName"] || "ZS Decor"
      }
    }
  };

  if (product.reviews && product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const averageRating = (totalRating / product.reviews.length).toFixed(1);

    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: product.reviews.length
    };

    productJsonLd.review = product.reviews.map(rev => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: rev.rating,
        bestRating: "5"
      },
      author: {
        "@type": "Person",
        name: rev.user?.name || "Anonymous"
      }
    }));
  }

  const categoryName = product.categories?.[0]?.name || "Products";
  const categorySlug = product.categories?.[0]?.slug || "";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": appUrl },
      { "@type": "ListItem", "position": 2, "name": categoryName, "item": `${appUrl}/products?category=${categorySlug}` },
      { "@type": "ListItem", "position": 3, "name": product.name, "item": `${appUrl}/products/${product.slug}` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading product...</div>}>
        <ProductClient product={product} settings={settings} />
      </Suspense>
    </>
  );
}
