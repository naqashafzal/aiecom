import { db } from "@/lib/prisma";
import ProductsClient from "./ProductsClient";
import { Suspense } from "react";

export default async function ProductsPage() {
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' }
  });
  
  const products = await db.product.findMany({
    where: { status: 'ACTIVE' },
    include: {
      categories: true,
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
    <Suspense fallback={<div className="container mx-auto py-20 text-center">Loading products...</div>}>
      <ProductsClient initialProducts={products} categories={categories} storeCurrency={storeCurrency} />
    </Suspense>
  );
}
