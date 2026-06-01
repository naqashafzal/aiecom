"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, Heart, Star, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useSearchParams } from "next/navigation";

export default function ProductsClient({ initialProducts, categories }: { initialProducts: any[], categories: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("featured");
  const addItem = useCartStore((state) => state.addItem);
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const filteredProducts = initialProducts.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category.name === selectedCategory;
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    const priceA = a.salePrice || a.price;
    const priceB = b.salePrice || b.price;
    if (sortOrder === "price-low") return priceA - priceB;
    if (sortOrder === "price-high") return priceB - priceA;
    // Default / featured: sort by newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleAddToCart = (product: any) => {
    const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: image,
      quantity: 1,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 pb-8 border-b">
        <h1 className="text-4xl font-bold tracking-tight mb-4">All Products</h1>
        <p className="text-muted-foreground max-w-2xl">
          Browse our full catalog of premium products. Filter by category, price, or rating to find exactly what you need.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-semibold text-lg flex items-center mb-4">
                <Filter className="mr-2 h-5 w-5" /> Categories
              </h3>
              <div className="space-y-2 flex flex-col">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === "All" 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === cat.name 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Sort By</h3>
              <select 
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="featured">Featured / Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Showing {filteredProducts.length} products
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";
              const displayPrice = product.salePrice || product.price;

              return (
                <div key={product.id} className="group flex flex-col bg-background rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <button className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-md rounded-full text-muted-foreground hover:text-destructive hover:bg-background transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm">
                      <Heart className="h-4 w-4" />
                    </button>
                    <Link href={`/product/${product.slug}`}>
                      <img 
                        src={image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                      <Link href={`/product/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="font-bold text-xl">${displayPrice.toFixed(2)}</span>
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        variant="secondary" 
                        size="sm" 
                        className="rounded-full font-semibold px-4 shadow-sm hover:shadow"
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Out" : "Add"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-2">No products found</h2>
              <p className="text-muted-foreground">Try selecting a different category.</p>
              <Button onClick={() => setSelectedCategory("All")} className="mt-6" variant="outline">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
