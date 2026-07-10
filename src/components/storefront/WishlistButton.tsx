"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/app/(storefront)/wishlist-actions";
import { useSession } from "next-auth/react";

export function WishlistButton({ 
  productId, 
  initialIsWishlisted = false,
  className = ""
}: { 
  productId: string;
  initialIsWishlisted?: boolean;
  className?: string;
}) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, setIsPending] = useState(false);
  const { status } = useSession();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      alert("Please log in to save items to your wishlist");
      return;
    }

    setIsPending(true);
    // Optimistic update
    setIsWishlisted(!isWishlisted);
    
    try {
      const result = await toggleWishlist(productId);
      if (result.success) {
        // Ensure state matches server
        setIsWishlisted(result.action === 'added');
      } else {
        // Revert on error
        setIsWishlisted(isWishlisted);
        console.error(result.error || 'Something went wrong');
      }
    } catch (error) {
      setIsWishlisted(isWishlisted);
      console.error('Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`h-9 w-9 bg-background/80 backdrop-blur rounded-full flex items-center justify-center transition-all ${
        isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
      } ${className}`}
      aria-label="Toggle wishlist"
    >
      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
    </button>
  );
}
