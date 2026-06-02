import { db } from "@/lib/prisma";
import ProductsClient from "../../products/ProductsClient";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const category = await db.category.findUnique({
    where: { slug }
  });

  if (!category) {
    return notFound();
  }

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' }
  });
  
  const products = await db.product.findMany({
    where: { status: 'ACTIVE' },
    include: {
      category: true,
      images: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const currencySetting = await db.setting.findUnique({
    where: { key: "storeCurrency" }
  });
  const storeCurrency = currencySetting?.value || "USD";

  return (
    <Suspense fallback={<div className="container mx-auto py-20 text-center">Loading collection...</div>}>
      <ProductsClient initialProducts={products} categories={categories} initialCategory={category.name} storeCurrency={storeCurrency} />
    </Suspense>
  );
}
