import Link from "next/link";
import Image from "next/image";
import { getCachedCategories } from "@/lib/cache";

export const revalidate = 60; // Cache for 60 seconds

export async function generateMetadata() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zsdecor-ecom.vercel.app";
  return {
    title: "All Categories",
    description: "Browse our wide selection of categories.",
    alternates: {
      canonical: `${appUrl}/categories`,
    }
  };
}

export default async function CategoriesPage() {
  const categories = await getCachedCategories();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zsdecor-ecom.vercel.app";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": appUrl },
      { "@type": "ListItem", "position": 2, "name": "Categories", "item": `${appUrl}/categories` }
    ]
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">Shop by Category</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Discover our curated collections. From essentials to premium picks, find exactly what you're looking for.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories.map((cat) => {
              const image = cat.imageId || "/placeholder.png";
              return (
                <Link 
                  key={cat.id} 
                  href={`/products?category=${cat.slug}`} 
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                    <Image 
                      src={image} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                      alt={cat.name} 
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-base md:text-lg">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
