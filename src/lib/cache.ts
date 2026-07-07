import { unstable_cache } from "next/cache";
import { db } from "./prisma";

// Ultra-fast cached query for the homepage latest products
export const getCachedLatestProducts = unstable_cache(
  async (take: number = 24) => {
    return await db.product.findMany({
      where: { status: 'ACTIVE' },
      take,
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });
  },
  ['latest-products'],
  { revalidate: 60, tags: ['products'] }
);

// Ultra-fast cached query for the homepage flash sales
export const getCachedFlashSaleProducts = unstable_cache(
  async (take: number = 6) => {
    return await db.product.findMany({
      where: { status: 'ACTIVE', salePrice: { not: null } },
      take,
      include: { images: true }
    });
  },
  ['flash-sale-products'],
  { revalidate: 60, tags: ['products'] }
);

// Ultra-fast cached query for generic active products
export const getCachedActiveProducts = unstable_cache(
  async (take: number = 6) => {
    return await db.product.findMany({
      where: { status: 'ACTIVE' },
      take,
      include: { images: true }
    });
  },
  ['active-products'],
  { revalidate: 60, tags: ['products'] }
);

// Ultra-fast cached query for categories
export const getCachedCategories = unstable_cache(
  async (take: number = 12) => {
    return await db.category.findMany({
      take,
    });
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] } // Categories rarely change, cache for 1 hour
);
