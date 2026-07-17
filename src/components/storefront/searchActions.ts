"use server";

import { db } from "@/lib/prisma";

export async function searchProducts(query: string) {
  if (!query || query.length < 2) return [];
  
  const results = await db.product.findMany({
    where: {
      status: "ACTIVE",
      name: { contains: query, mode: "insensitive" }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      salePrice: true
    },
    take: 5
  });
  
  return results;
}
