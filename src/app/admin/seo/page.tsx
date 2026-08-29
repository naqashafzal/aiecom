import { db } from "@/lib/prisma";
import { SeoDashboardClient } from "./SeoDashboardClient";

export default async function SeoDashboardPage() {
  const [products, categories, pages, posts] = await Promise.all([
    db.product.findMany({
      select: { id: true, name: true, slug: true, metaTitle: true, metaDescription: true },
      orderBy: { createdAt: "desc" }
    }),
    db.category.findMany({
      select: { id: true, name: true, slug: true, metaTitle: true, metaDescription: true },
      orderBy: { createdAt: "desc" }
    }),
    db.page.findMany({
      select: { id: true, title: true, slug: true, metaTitle: true, metaDescription: true },
      orderBy: { createdAt: "desc" }
    }),
    db.post.findMany({
      select: { id: true, title: true, slug: true, metaTitle: true, metaDescription: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced SEO Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your website's SEO health and use AI to automatically generate highly optimized meta titles and descriptions.
        </p>
      </div>
      
      <SeoDashboardClient 
        products={products}
        categories={categories}
        pages={pages}
        posts={posts}
      />
    </div>
  );
}
