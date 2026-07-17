import { db } from "@/lib/prisma";
import ProductsClient from "./ProductsClient";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;
  const search = typeof params.search === 'string' ? params.search : "";
  const category = typeof params.category === 'string' ? params.category : "All";
  const sort = typeof params.sort === 'string' ? params.sort : "featured";

  const limit = 12; // Default page size for grid
  const skip = (page - 1) * limit;

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' }
  });

  const whereCondition: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
  };

  if (category && category !== "All") {
    whereCondition.categories = {
      some: {
        name: category
      }
    };
  }

  if (search) {
    whereCondition.name = {
      contains: search,
      mode: 'insensitive'
    };
  }

  let orderByCondition: Prisma.ProductOrderByWithRelationInput = {
    createdAt: 'desc'
  };

  if (sort === 'price-low') {
    orderByCondition = { price: 'asc' };
  } else if (sort === 'price-high') {
    orderByCondition = { price: 'desc' };
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where: whereCondition,
      include: {
        categories: true,
        images: true,
      },
      orderBy: orderByCondition,
      skip,
      take: limit,
    }),
    db.product.count({ where: whereCondition })
  ]);

  const totalPages = Math.ceil(total / limit);

  const currencySetting = await db.setting.findUnique({
    where: { key: "storeCurrency" }
  });
  const storeCurrency = currencySetting?.value || "USD";

  return (
    <Suspense fallback={<div className="container mx-auto py-20 text-center">Loading products...</div>}>
      <ProductsClient 
        initialProducts={products} 
        categories={categories} 
        storeCurrency={storeCurrency} 
        currentPage={page}
        totalPages={totalPages}
        totalProducts={total}
        initialCategory={category}
        initialSort={sort}
      />
    </Suspense>
  );
}
