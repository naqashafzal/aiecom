"use server";

import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function fetchProductsPage({
  page,
  search,
  category,
  sort,
  minPrice,
  maxPrice,
  inStock
}: {
  page: number;
  search?: string;
  category?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}) {
  const limit = 12;
  const skip = (page - 1) * limit;

  const whereCondition: Prisma.ProductWhereInput = {
    status: 'ACTIVE',
  };

  if (category && category !== "All") {
    whereCondition.categories = {
      some: {
        OR: [
          { slug: category },
          { name: category }
        ]
      }
    };
  }

  if (search) {
    whereCondition.name = {
      contains: search,
      mode: 'insensitive'
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: any = {};
    if (minPrice !== undefined && !isNaN(minPrice)) priceFilter.gte = minPrice;
    if (maxPrice !== undefined && !isNaN(maxPrice)) priceFilter.lte = maxPrice;
    if (Object.keys(priceFilter).length > 0) {
      whereCondition.price = priceFilter;
    }
  }

  if (inStock) {
    whereCondition.stock = { gt: 0 };
  }

  let orderByCondition: Prisma.ProductOrderByWithRelationInput = {
    createdAt: 'desc'
  };

  if (sort === 'price-low') {
    orderByCondition = { price: 'asc' };
  } else if (sort === 'price-high') {
    orderByCondition = { price: 'desc' };
  }

  const products = await db.product.findMany({
    where: whereCondition,
    include: {
      categories: true,
      images: true,
    },
    orderBy: orderByCondition,
    skip,
    take: limit,
  });

  return products;
}
