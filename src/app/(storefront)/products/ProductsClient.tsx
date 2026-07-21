"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Filter, Heart, Star, ShoppingCart, SlidersHorizontal, ChevronDown, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

export default function ProductsClient({ 
  initialProducts, 
  categories, 
  initialCategory, 
  storeCurrency = "USD",
  currentPage,
  totalPages,
  totalProducts,
  initialSort,
  initialSearch,
  initialMinPrice,
  initialMaxPrice,
  initialInStock
}: { 
  initialProducts: any[], 
  categories: any[], 
  initialCategory?: string, 
  storeCurrency?: string,
  currentPage: number,
  totalPages: number,
  totalProducts: number,
  initialSort: string,
  initialSearch?: string,
  initialMinPrice?: number,
  initialMaxPrice?: number,
  initialInStock?: boolean
}) {
  const addItem = useCartStore((state) => state.addItem);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice ? String(initialMinPrice) : "");
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice ? String(initialMaxPrice) : "");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  const currencySymbol = (() => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency })
        .formatToParts(0)
        .find(p => p.type === 'currency')?.value || storeCurrency;
    } catch {
      return storeCurrency;
    }
  })();

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    updateFilters({ category: category === "All" ? null : category });
  };

  const handleSortChange = (sort: string) => {
    updateFilters({ sort });
  };

  const handleInStockChange = (checked: boolean) => {
    updateFilters({ inStock: checked ? "true" : null });
  };

  const applyPriceFilter = () => {
    const updates: Record<string, string | null> = {};
    if (minPrice && !isNaN(Number(minPrice))) updates.minPrice = minPrice;
    else updates.minPrice = null;
    
    if (maxPrice && !isNaN(Number(maxPrice))) updates.maxPrice = maxPrice;
    else updates.maxPrice = null;
    
    updateFilters(updates);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  const handleAddToCart = (product: any) => {
    const image = product.images?.[0]?.url || "/placeholder.png";
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: image,
      quantity: 1,
    });
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      {/* Clear Filters & Search */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center">
          <SlidersHorizontal className="mr-2 h-5 w-5" /> Filters
        </h3>
        <button 
          onClick={clearFilters}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Clear All
        </button>
      </div>

      {initialSearch && (
        <div className="bg-muted p-3 rounded-md flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Search:</span> <span className="font-bold">"{initialSearch}"</span>
          </div>
          <button onClick={() => updateFilters({ search: null })} className="text-muted-foreground hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-md mb-4 uppercase tracking-wider text-sm text-gray-900">Categories</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${initialCategory === "All" || !initialCategory ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300 group-hover:border-primary'}`}>
              {(initialCategory === "All" || !initialCategory) && <Check className="h-3 w-3" />}
            </div>
            <input type="radio" name="category" checked={initialCategory === "All" || !initialCategory} onChange={() => handleCategoryChange("All")} className="hidden" />
            <span className={`text-sm ${initialCategory === "All" || !initialCategory ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>All Products</span>
          </label>
          {categories.map((cat) => {
            const isActive = initialCategory === cat.slug || initialCategory === cat.name;
            return (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300 group-hover:border-primary'}`}>
                  {isActive && <Check className="h-3 w-3" />}
                </div>
                <input type="radio" name="category" checked={isActive} onChange={() => handleCategoryChange(cat.slug)} className="hidden" />
                <span className={`text-sm ${isActive ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{cat.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-md mb-4 uppercase tracking-wider text-sm text-gray-900">Price Range</h4>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol}</span>
            <input 
              type="number" 
              placeholder="Min" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full h-10 pl-7 pr-3 rounded-md border border-input text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol}</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full h-10 pl-7 pr-3 rounded-md border border-input text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
        <Button onClick={applyPriceFilter} variant="outline" className="w-full text-xs font-semibold h-9 shadow-sm">
          Apply Price
        </Button>
      </div>

      {/* Availability */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-md mb-4 uppercase tracking-wider text-sm text-gray-900">Availability</h4>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${initialInStock ? 'bg-primary border-primary text-primary-foreground' : 'border-gray-300 group-hover:border-primary'}`}>
            {initialInStock && <Check className="h-3 w-3" />}
          </div>
          <input type="checkbox" checked={!!initialInStock} onChange={(e) => handleInStockChange(e.target.checked)} className="hidden" />
          <span className={`text-sm ${initialInStock ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 pb-8 border-b border-gray-100">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">All Products</h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Browse our full catalog of premium products. Use our advanced filters to find exactly what you need.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex flex-col gap-4 mb-2">
          <div className="flex items-center justify-between">
            <Button onClick={() => setIsMobileFiltersOpen(true)} variant="outline" className="font-semibold shadow-sm w-full sm:w-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto ml-0 sm:ml-4 mt-4 sm:mt-0">
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:border-primary focus:outline-none"
                value={initialSort}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
          <span className="text-sm font-medium text-muted-foreground block text-center sm:hidden">
            Showing {initialProducts.length} of {totalProducts} products
          </span>
        </div>

        {/* Mobile Filter Drawer Overlay */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity" onClick={() => setIsMobileFiltersOpen(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-background shadow-xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex justify-end mb-4">
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-muted rounded-full hover:bg-gray-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white border border-gray-100 shadow-sm rounded-xl p-6">
            <SidebarContent />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 hidden lg:flex items-center justify-between bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
            <span className="text-sm font-medium text-muted-foreground">
              Showing <strong className="text-gray-900">{initialProducts.length}</strong> of <strong className="text-gray-900">{totalProducts}</strong> products
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Sort By:</span>
              <select 
                className="h-10 px-4 rounded-md border border-input bg-background text-sm font-medium cursor-pointer hover:border-gray-400 focus:border-primary transition-colors outline-none"
                value={initialSort}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="featured">Featured / Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {initialProducts.map((product) => {
              const image = product.images?.[0]?.url || "/placeholder.png";
              const displayPrice = product.salePrice || product.price;

              return (
                <div key={product.id} className="group flex flex-col bg-background rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm">
                      <Heart className="h-4 w-4" />
                    </button>
                    {product.stock === 0 && (
                      <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded z-10">
                        Out of Stock
                      </span>
                    )}
                    {product.salePrice && product.stock > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded z-10">
                        Sale
                      </span>
                    )}
                    <Link href={`/products/${product.slug}`}>
                      <Image 
                        src={image} 
                        alt={product.name}
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    </Link>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[40px]">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-base md:text-lg text-gray-900">{formatPrice(displayPrice)}</span>
                        {product.salePrice && <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.price)}</span>}
                      </div>
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        variant="default" 
                        size="icon" 
                        className={`rounded-full h-9 w-9 shadow-sm hover:shadow-md transition-all ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {initialProducts.length === 0 && (
            <div className="text-center py-32 bg-gray-50 rounded-2xl border border-gray-100 mt-6">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">No products found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria.</p>
              <Button onClick={clearFilters} variant="default" className="font-semibold px-8 py-5 rounded-full shadow-md">
                Clear All Filters
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 mb-8">
              <Pagination totalPages={totalPages} currentPage={currentPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
