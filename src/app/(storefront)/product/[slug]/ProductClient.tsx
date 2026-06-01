"use client";

import { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, Heart, ArrowLeft, Minus, Plus, Share2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProductClient({ product, settings }: { product: any, settings?: Record<string, string> }) {
  const images = product.images?.length > 0 
    ? product.images.map((i: any) => i.url) 
    : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500"];
    
  const colors = [
    { id: "default", name: "Default", value: "#1a1a1a" }
  ];

  const specs = product.specifications || [];

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);
  const addViewedItem = useRecentlyViewedStore((state) => state.addItem);
  const recentlyViewedItems = useRecentlyViewedStore((state) => state.items);

  const policy1Title = settings?.["storefront_policy_1_title"] || "Free Worldwide Shipping";
  const policy2Title = settings?.["storefront_policy_2_title"] || "2 Year Extended Warranty";

  useEffect(() => {
    setMounted(true);
    addViewedItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.salePrice || product.price,
      image: images[0]
    });
  }, [product.id, product.slug, product.name, product.price, product.salePrice, images, addViewedItem]);

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedColor.id}`,
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: images[0],
      quantity: quantity,
      variant: { id: selectedColor.id, name: selectedColor.name }
    });
  };

  const displayPrice = product.salePrice || product.price;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Shop
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row gap-4">
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible no-scrollbar p-1">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'}`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-square bg-muted rounded-2xl overflow-hidden relative group">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-semibold text-lg">4.8</span>
              <span className="text-muted-foreground ml-1">(124 reviews)</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl font-black text-primary">${displayPrice.toFixed(2)}</div>
            {product.salePrice && (
              <div className="text-lg text-muted-foreground line-through">${product.price.toFixed(2)}</div>
            )}
            {product.salePrice && (
              <div className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                Super Deal
              </div>
            )}
          </div>
          
          {/* Multivendor Store Card */}
          <div className="flex items-center justify-between p-4 mb-8 bg-muted/30 border rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-background border flex items-center justify-center overflow-hidden">
                <Store className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Aura Official Store</h4>
                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                  <Star className="h-3 w-3 text-primary fill-primary mr-1" />
                  <span className="font-semibold text-foreground">4.9</span>
                  <span className="mx-1">•</span>
                  <span>98.5% Positive Feedback</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">Follow</Button>
          </div>

          <p className="text-muted-foreground text-sm mb-8 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>

          <div className="mb-8">
            <h3 className="font-semibold mb-3 flex items-center justify-between">
              Color: <span className="text-muted-foreground font-normal">{selectedColor.name}</span>
            </h3>
            <div className="flex gap-3">
              {colors.map((color: any) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selectedColor.id === color.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105 border shadow-sm'}`}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex items-center border-2 border-input rounded-full h-14 w-full sm:w-32 bg-background">
              <button 
                className="flex-1 flex justify-center items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-semibold text-lg w-10 text-center">{quantity}</span>
              <button 
                className="flex-1 flex justify-center items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              size="lg" 
              className="flex-1 h-14 rounded-full text-lg shadow-xl hover:shadow-primary/25 transition-all"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-4 py-6 border-y mb-8 bg-muted/20 rounded-2xl px-6">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium whitespace-pre-wrap">{policy1Title.replace(" ", "\n")}</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium whitespace-pre-wrap">{policy2Title.replace(" ", "\n")}</span>
            </div>
          </div>

          {/* Specifications */}
          {specs.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">Specifications</h3>
              <div className="space-y-3">
                {specs.map((spec: any, idx: number) => (
                  <div key={idx} className="flex border-b pb-3 border-dashed">
                    <span className="w-1/2 text-muted-foreground">{spec.name}</span>
                    <span className="w-1/2 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed Section */}
      {mounted && recentlyViewedItems.filter(item => item.id !== product.id).length > 0 && (
        <div className="mt-24 border-t pt-16">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Recently Viewed</h2>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
            {recentlyViewedItems.filter(item => item.id !== product.id).map((item) => (
              <div key={item.id} className="min-w-[200px] w-[200px] sm:min-w-[250px] sm:w-[250px] snap-start group">
                <Link href={`/product/${item.slug}`}>
                  <div className="aspect-[4/5] rounded-xl bg-muted overflow-hidden mb-4 relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                  <p className="font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
