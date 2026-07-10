"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, Heart, Home, LayoutGrid } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Top Bar (Black) */}
      <header className="bg-black text-white py-3 md:py-4 px-4 md:px-12 flex flex-wrap items-center justify-between gap-y-3">
        
        {/* Mobile Menu Button & Search (Left) */}
        <div className="flex items-center gap-4 md:hidden shrink-0 order-1 w-1/3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
          <button onClick={() => {
            const searchInput = document.getElementById('mobile-search-input');
            if (searchInput) searchInput.focus();
          }}>
            <Search className="w-5 h-5 font-light" strokeWidth={1.5} />
          </button>
        </div>

        {/* Desktop Menu Button (Left) */}
        <div className="hidden md:flex items-center shrink-0 order-1">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Logo (Center on Mobile, Left on Desktop) */}
        <div className="flex items-center justify-center md:justify-start shrink-0 order-2 md:order-1 w-1/3 md:w-auto">
          <StoreLogo 
            className="text-white" 
            logoUrl={logoUrl}
            logoText={logoText}
            logoHeight={logoHeight}
            logoAccent={logoAccent}
          />
        </div>

        {/* Icons */}
        <div className="flex items-center justify-end gap-4 md:gap-6 shrink-0 order-3 md:order-3 w-1/3 md:w-auto">
          
          {/* Mobile User Icon */}
          <Link href="/account" className="md:hidden flex flex-col items-center hover:text-gray-300 transition-colors">
            <User className="w-5 h-5 font-light" strokeWidth={1.5} />
          </Link>
          <Link href="/wishlist" className="hidden md:flex flex-col items-center hover:text-gray-300 transition-colors">
            <Heart className="w-6 h-6 mb-1 font-light" strokeWidth={1.5} />
            <span className="text-[10px]">Wish Lists</span>
          </Link>
          <Link href="/account" className="hidden md:flex flex-col items-center hover:text-gray-300 transition-colors">
            <User className="w-6 h-6 mb-1 font-light" strokeWidth={1.5} />
            <span className="text-[10px]">Sign In</span>
          </Link>
          <button className="flex flex-col items-center relative hover:text-gray-300 transition-colors" onClick={toggleCart}>
            <div className="relative md:mb-1">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 font-light" strokeWidth={1.5} />
              {mounted && getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-100 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-pink-200">
                  {getCartCount()}
                </span>
              )}
            </div>
            <span className="text-[10px] hidden md:block">Cart</span>
          </button>
        </div>

        {/* Search Bar (Desktop Only) */}
        <div className="hidden md:block md:flex-1 md:mx-8 relative order-3 md:order-2">
          <input 
            id="mobile-search-input"
            type="text" 
            placeholder="Search the store" 
            className="w-full bg-white text-black rounded-full py-2.5 px-6 focus:outline-none text-sm placeholder-gray-500"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer" />
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

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black text-white px-4 py-4 flex flex-col gap-4 border-t border-[#333] shadow-lg absolute w-full left-0">
          <div className="font-bold mb-2">Menu</div>
          {menuLinks.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.url} 
              className={`text-sm pb-2 border-b border-[#333] ${link.highlight ? 'text-gray-300 font-bold' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/wishlist" className="text-sm pb-2 border-b border-[#333] flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <Heart className="w-4 h-4" /> Wish Lists
          </Link>
          <Link href="/account" className="text-sm flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <User className="w-4 h-4" /> Sign In / Account
          </Link>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50">
        <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-black">
          <Home className="w-5 h-5 mb-1" strokeWidth={1.5} />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/products?search=" className="flex flex-col items-center text-gray-600 hover:text-black">
          <Search className="w-5 h-5 mb-1" strokeWidth={1.5} />
          <span className="text-[10px]">Search</span>
        </Link>
        <Link href="/products" className="flex flex-col items-center text-gray-600 hover:text-black">
          <LayoutGrid className="w-5 h-5 mb-1" strokeWidth={1.5} />
          <span className="text-[10px]">Collection</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center text-gray-600 hover:text-black">
          <User className="w-5 h-5 mb-1" strokeWidth={1.5} />
          <span className="text-[10px]">Account</span>
        </Link>
        <button onClick={toggleCart} className="flex flex-col items-center text-gray-600 hover:text-black relative">
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-1" strokeWidth={1.5} />
            {mounted && getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </button>
      </div>
    </div>
  );
}
