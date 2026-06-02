"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    image: string;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); // Stop link click
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      slug: product.slug,
    });
  };

  return (
    <Button 
      size="sm" 
      onClick={handleAdd}
      className="w-full mt-3 rounded-full shadow-sm hover:shadow-md transition-all z-10 relative"
    >
      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
    </Button>
  );
}
