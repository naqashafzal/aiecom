import { unstable_cache } from "next/cache";
import { cache } from "react";
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
  async () => {
    return await db.category.findMany();
  },
  ['all-categories'],
  { revalidate: 3600, tags: ['categories'] } // Categories rarely change, cache for 1 hour
);

// Ultra-fast cached query for all global settings to prevent N+1 on every page load
export const getCachedSettings = unstable_cache(
  async () => {
    const settings = await db.setting.findMany();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  },
  ['global-settings'],
  { revalidate: 3600, tags: ['settings'] }
);

// React cache to deduplicate Prisma queries within a single request (e.g. metadata + page render)
export const getProductBySlug = cache(async (slug: string) => {
  return await db.product.findUnique({
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
});
