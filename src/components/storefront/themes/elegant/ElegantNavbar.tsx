"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { StoreLogo } from "@/components/storefront/StoreLogo";
import { useState, useEffect } from "react";

export function ElegantNavbar({ 
  menuLinks = [],
  logoUrl,
  logoText,
  logoHeight,
  logoAccent
}: { 
  menuLinks?: any[];
  logoUrl?: string;
  logoText?: string;
  logoHeight?: number;
  logoAccent?: string;
}) {
  const { getCartCount, toggleCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Top Bar (Black) */}
      <header className="bg-black text-white py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="md:hidden"><Menu className="w-6 h-6" /></button>
          <StoreLogo 
            className="text-white" 
            logoUrl={logoUrl}
            logoText={logoText}
            logoHeight={logoHeight}
            logoAccent={logoAccent}
          />
        </div>

        {/* Search Bar */}
        <div className="flex-1 w-full max-w-3xl mx-4 md:mx-8 relative">
          <input 
            type="text" 
            placeholder="Search the store" 
            className="w-full bg-white text-black rounded-full py-2.5 px-6 focus:outline-none text-sm placeholder-gray-500"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer" />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/wishlist" className="hidden md:flex flex-col items-center hover:text-gray-300 transition-colors">
            <Heart className="w-6 h-6 mb-1 font-light" strokeWidth={1.5} />
            <span className="text-[10px]">Wish Lists</span>
          </Link>
          <Link href="/login" className="hidden md:flex flex-col items-center hover:text-gray-300 transition-colors">
            <User className="w-6 h-6 mb-1 font-light" strokeWidth={1.5} />
            <span className="text-[10px]">Sign In</span>
          </Link>
          <button className="flex flex-col items-center relative hover:text-gray-300 transition-colors" onClick={toggleCart}>
            <div className="relative mb-1">
              <ShoppingCart className="w-6 h-6 font-light" strokeWidth={1.5} />
              {mounted && getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-100 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-pink-200">
                  {getCartCount()}
                </span>
              )}
            </div>
            <span className="text-[10px]">Cart</span>
          </button>
        </div>
      </header>

      {/* Bottom Navigation Bar (Dark Grey) */}
      <div className="bg-[#444444] text-white border-t border-[#333]">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-center gap-8 overflow-x-auto py-2.5">
          {menuLinks.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.url} 
              className={`text-xs whitespace-nowrap hover:text-gray-300 transition-colors ${link.highlight ? 'text-gray-300' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
