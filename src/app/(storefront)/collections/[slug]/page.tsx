import { db } from "@/lib/prisma";
import ProductsClient from "../../products/ProductsClient";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

export default async function CollectionPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params;
  const sParams = await searchParams;
  
  const category = await db.category.findUnique({
    where: { slug }
  });

  if (!category) {
    return notFound();
  }

  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) || 1 : 1;
  const search = typeof sParams.search === 'string' ? sParams.search : "";
  const sort = typeof sParams.sort === 'string' ? sParams.sort : "featured";

  const limit = 12; // Page size
  const skip = (page - 1) * limit;

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' }
  });
  
  const whereCondition: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
    categories: {
      some: {
        slug: slug
      }
    }
  };

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
    <Suspense fallback={<div className="container mx-auto py-20 text-center">Loading collection...</div>}>
      <ProductsClient 
        initialProducts={products} 
        categories={categories} 
        initialCategory={category.name} 
        storeCurrency={storeCurrency} 
        currentPage={page}
        totalPages={totalPages}
        totalProducts={total}
        initialSort={sort}
      />
    </Suspense>
  );
}
