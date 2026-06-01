"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

export function Navbar() {
  const { getCartCount, toggleCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4 lg:w-[200px] shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
          <Link href="/" className="font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity">
            Aura<span className="text-primary">.</span>
          </Link>
        </div>

        {/* Desktop Search Bar (Middle) */}
        <div className="hidden sm:flex flex-1 max-w-2xl mx-auto">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const q = formData.get("q");
              if (q) window.location.href = `/products?search=${encodeURIComponent(q as string)}`;
            }}
            className="flex w-full items-center relative"
          >
            <input 
              type="search" 
              name="q"
              placeholder="Search for products..." 
              className="w-full h-10 pl-4 pr-10 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <button type="submit" className="absolute right-0 h-10 w-12 flex items-center justify-center text-muted-foreground hover:text-primary rounded-r-full">
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 lg:w-[200px] shrink-0">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Wishlist</span>
          </Button>
          <Link href="/login">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>
          <Button 
            variant="default" 
            size="icon" 
            className="rounded-full h-10 w-10 relative"
            onClick={toggleCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {getCartCount()}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
