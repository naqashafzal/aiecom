import { db } from "@/lib/prisma";
import { permanentRedirect } from "next/navigation";
import { SmartNotFound } from "@/components/storefront/SmartNotFound";

export default async function CatchAll({ params }: { params: { catchAll: string[] } }) {
  const path = "/" + params.catchAll.join("/");

  // 1. Check if the broken URL exists in the Redirect DB (SEO Redirect Manager)
  const redirectRule = await db.redirect.findUnique({
    where: { sourceUrl: path }
  });

  if (redirectRule) {
    // Issue an SEO-friendly 308 Permanent Redirect to the destination
    permanentRedirect(redirectRule.destinationUrl);
  }

  // 2. If it's not in the DB, it's a true 404. Let's do the Smart 404 Auto-Match logic.
  // We extract keywords from the broken URL path.
  const words = path.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2 && w !== 'products' && w !== 'category');
  
  let recommendations: any[] = [];

  if (words.length > 0) {
    // Find products that match the keywords
    const products = await db.product.findMany({ 
      select: { 
        id: true,
        name: true, 
        slug: true, 
        price: true,
        salePrice: true,
        images: {
          take: 1
        }
      },
      where: {
        status: "ACTIVE"
      }
    });
    
    // Simple relevance scoring
    const scoredProducts = products.map(p => {
      let score = 0;
      const targetString = `${p.name.toLowerCase()} ${p.slug.toLowerCase()}`;
      for (const w of words) {
        if (targetString.includes(w)) score++;
      }
      return { ...p, score };
    }).filter(p => p.score > 0);

    // Sort by score descending and take top 4
    recommendations = scoredProducts.sort((a, b) => b.score - a.score).slice(0, 4);
  }

  // If no specific recommendations were found, just fetch the newest/featured products
  if (recommendations.length === 0) {
    recommendations = await db.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        name: true, 
        slug: true, 
        price: true,
        salePrice: true,
        images: {
          take: 1
        }
      }
    });
  }

  // Render the Smart 404 Page (we pass the path and recommendations)
  return <SmartNotFound path={path} recommendations={recommendations} />;
}
