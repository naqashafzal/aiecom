import { MetadataRoute } from 'next'
import { db } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zsdecor-ecom.vercel.app";

  // Fetch all active products
  const products = await db.product.findMany({
    select: { slug: true, updatedAt: true },
    where: { isActive: true }
  });

  // Fetch all categories
  const categories = await db.category.findMany({
    select: { slug: true, updatedAt: true }
  });

  const productEntries = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const categoryEntries = categories.map((category) => ({
    url: `${baseUrl}/products?category=${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categoryEntries,
    ...productEntries,
  ]
}
