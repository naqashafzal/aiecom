"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getMoreProducts } from "./actions";

export function MoreToLoveClient({ initialProducts, title, storeCurrency }: { initialProducts: any[], title: string, storeCurrency: string }) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, products.length]);

  const loadMore = async () => {
    setIsLoading(true);
    const newProducts = await getMoreProducts(products.length, 20);
    if (newProducts.length === 0) {
      setHasMore(false);
    } else {
      setProducts(prev => [...prev, ...newProducts]);
    }
    setIsLoading(false);
  };

  return (
    <section className="mb-16">
      <div className="flex justify-center mb-8">
        <h2 className="text-3xl font-black text-[#222] relative before:content-[''] before:w-12 before:h-[2px] before:bg-[#222] before:absolute before:-left-16 before:top-1/2 after:content-[''] after:w-12 after:h-[2px] after:bg-[#222] after:absolute after:-right-16 after:top-1/2">
          {title}
        </h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product, i) => {
          const image = product.images?.[0]?.url || "/placeholder.png";
          const displayPrice = product.salePrice || product.price;
          // Deterministic sold count to prevent hydration mismatch
          const sold = (product.name.length * 47) % 900 + 100; 
          
          return (
            <Link href={`/products/${product.slug}`} key={`${product.id}-${i}`} className="bg-white rounded-xl overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all group flex flex-col border border-transparent hover:border-gray-200">
              <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden">
                <Image src={image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" className="object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h4 className="text-[13px] text-[#444] line-clamp-2 leading-snug mb-1 group-hover:underline flex-1">{product.name}</h4>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-black font-black text-lg">{formatPrice(displayPrice)}</span>
                </div>
                <div className="flex items-center gap-1 mt-auto">
                  <span className="bg-[#FFF0F1] text-[#E53238] text-[10px] font-bold px-1 rounded-sm">Free shipping</span>
                  <span className="text-[#999] text-[11px] ml-auto">{sold}+ sold</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      
      {/* Loading trigger */}
      {hasMore && (
        <div ref={observerRef} className="h-20 flex items-center justify-center mt-8">
          {isLoading ? (
            <div className="w-8 h-8 border-4 border-[#0071FF] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="w-8 h-8"></div>
          )}
        </div>
      )}
      {!hasMore && products.length > 0 && (
         <div className="text-center mt-12 text-muted-foreground text-sm font-medium">
           You've seen all products!
         </div>
      )}
    </section>
  );
}
