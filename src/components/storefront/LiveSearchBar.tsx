"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { searchProducts } from "./searchActions";
import { useRouter } from "next/navigation";

export function LiveSearchBar({ 
  placeholder = "Search products...",
  className = "",
  inputClassName = "w-full h-11 pl-5 pr-14 rounded-full border-2 border-foreground bg-background focus:outline-none focus:border-foreground focus:ring-0 text-sm font-medium",
  buttonClassName = "absolute right-1 top-1 bottom-1 w-14 bg-foreground flex items-center justify-center text-background rounded-full hover:bg-foreground/90 transition-colors"
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    
    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchProducts(query);
        setResults(res);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className={`flex w-full items-center relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full h-full items-center relative">
        <input 
          type="search" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          className={inputClassName}
        />
        <button 
          type="submit" 
          className={buttonClassName}
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-[100]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="flex flex-col max-h-96 overflow-y-auto">
              {results.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/products/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <div className="w-12 h-12 relative rounded bg-gray-100 shrink-0 overflow-hidden">
                    <Image 
                      src={product.images?.[0]?.url || "/placeholder.png"} 
                      fill 
                      alt={product.name} 
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="text-sm font-semibold text-gray-900 truncate">{product.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-medium">
                      ${(product.salePrice || product.price).toFixed(2)}
                    </div>
                  </div>
                </Link>
              ))}
              <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                <button 
                  onClick={handleSubmit}
                  className="text-xs font-semibold text-gray-900 hover:text-primary transition-colors py-1 px-3"
                >
                  View all results
                </button>
              </div>
            </div>
          ) : (
             <div className="p-4 text-center text-sm text-gray-500">No products found.</div>
          )}
        </div>
      )}
    </div>
  );
}
