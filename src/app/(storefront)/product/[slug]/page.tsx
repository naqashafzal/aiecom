import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import ProductClient from "./ProductClient";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { images: true }
  });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";

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

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { images: true }
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
        ]
      }
    }
  });

  const settings = settingsRecords.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  return <ProductClient product={product} settings={settings} />;
}
