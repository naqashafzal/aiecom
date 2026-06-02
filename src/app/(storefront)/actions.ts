"use server";

import { db } from "@/lib/prisma";

export async function getMoreProducts(skip: number, take: number) {
  return await db.product.findMany({
    where: { status: 'ACTIVE' },
    skip,
    take,
    orderBy: { price: 'asc' }, // match the existing order
    include: { images: true }
  });
}
