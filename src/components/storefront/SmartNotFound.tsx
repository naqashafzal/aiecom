"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Home, ArrowRight, Frown } from "lucide-react";
import { useCurrency } from "@/components/storefront/currency-provider";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SmartNotFoundProps {
  path: string;
  recommendations: any[];
}

export function SmartNotFound({ path, recommendations }: SmartNotFoundProps) {
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-4">
      {/* 404 Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6 text-muted-foreground">
          <Frown className="w-10 h-10" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 text-primary">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">We couldn't find that page</h2>
        <p className="text-muted-foreground text-lg mb-8">
          The link <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{path}</span> might be broken, or the page has been moved.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center max-w-md mx-auto relative group">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for something else..."
            className="w-full h-14 pl-12 pr-4 rounded-full border-2 bg-background focus:outline-none focus:border-primary transition-colors text-base"
          />
          <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <button 
            type="submit"
            className="absolute right-2 bg-primary text-primary-foreground h-10 px-4 rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-8 gap-4">
            <div className="h-px bg-border flex-1 max-w-[200px]" />
            <h3 className="text-xl font-bold text-center text-foreground/80">Did you mean to look for these?</h3>
            <div className="h-px bg-border flex-1 max-w-[200px]" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                <div className="aspect-square bg-muted rounded-2xl overflow-hidden mb-4 relative">
                  <Image 
                    src={product.images?.[0]?.url || "/placeholder.png"} 
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.salePrice && (
                    <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">
                      SALE
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{formatPrice(product.salePrice || product.price)}</span>
                  {product.salePrice && (
                    <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-16 flex gap-4">
        <Link href="/">
          <button className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-full font-medium transition-colors">
            <Home className="w-4 h-4" /> Go to Homepage
          </button>
        </Link>
        <Link href="/products">
          <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-full font-medium transition-colors shadow-lg shadow-primary/20">
            Browse All Products <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
