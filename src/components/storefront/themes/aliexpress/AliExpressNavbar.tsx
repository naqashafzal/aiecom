"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, User, Menu, QrCode, ChevronDown, Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useCurrency } from "@/components/storefront/currency-provider";

import { StoreLogo } from "@/components/storefront/StoreLogo";

export function AliExpressNavbar({ 
  menuLinks = [],
  logoUrl,
  logoText,
  logoHeight,
  logoAccent
}: { 
  menuLinks?: Array<{name: string, url: string, highlight?: boolean}>;
  logoUrl?: string;
  logoText?: string;
  logoHeight?: number;
  logoAccent?: string;
}) {
  const { getCartCount, toggleCart } = useCartStore();
  const { currencyCode } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic menu from props

  return (
    <header className="w-full bg-background border-b z-50">
      {/* Top Black Strip (Optional, AliExpress often has a thin one) */}
      <div className="h-1 bg-[#1a1a1a] w-full"></div>

      <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between py-4 gap-6">
          
          {/* Logo */}
          <StoreLogo 
            className="text-foreground" 
            logoUrl={logoUrl}
            logoText={logoText}
            logoHeight={logoHeight}
            logoAccent={logoAccent}
          />

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl hidden md:block">
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
                placeholder="Hglrc M100 5883 Gps Module" 
                className="w-full h-11 pl-5 pr-14 rounded-full border-2 border-foreground bg-background focus:outline-none focus:border-foreground focus:ring-0 text-sm font-medium"
              />
              <button 
                type="submit" 
                className="absolute right-1 top-1 bottom-1 w-14 bg-foreground flex items-center justify-center text-background rounded-full hover:bg-foreground/90 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6 shrink-0">
            
            {/* Download App Removed */}

            {/* Language / Currency */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-6 h-4 bg-green-700 relative overflow-hidden flex items-center justify-center rounded-[2px]">
                <div className="absolute left-1 h-2 w-2 rounded-full bg-white flex items-center justify-center">
                  <div className="h-[3px] w-[3px] ml-[2px] mb-[2px] bg-green-700 rotate-45 transform origin-center"></div>
                </div>
              </div>
              <div className="text-[11px] leading-tight font-bold flex items-center">
                EN/ <br/> {mounted ? currencyCode : 'USD'}
              </div>
            </div>

            {/* Account */}
            <Link href="/login" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <User className="h-7 w-7 text-foreground" />
              <div className="text-[11px] leading-tight font-bold hidden sm:block">
                Hi, Welcome<br/>Account
              </div>
            </Link>

            {/* Cart */}
            <button 
              onClick={toggleCart}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity relative"
            >
              <div className="relative">
                <ShoppingCart className="h-7 w-7 text-foreground" />
                {mounted && getCartCount() > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-foreground text-background text-[10px] font-bold h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </div>
              <div className="text-[12px] font-bold hidden sm:block">
                Cart
              </div>
            </button>

          </div>
        </div>

        {/* Bottom Nav Row */}
        <div className="flex items-center gap-6 pb-3 pt-1 overflow-x-auto no-scrollbar">
          
          {/* All Categories Dropdown Button */}
          <Link href="/products" className="flex items-center gap-2 bg-muted/60 hover:bg-muted py-2 px-4 rounded-full text-sm font-bold shrink-0 transition-colors">
            <Menu className="h-4 w-4" /> All Categories
          </Link>

          {/* Category Links */}
          <nav className="flex items-center gap-5 sm:gap-7 shrink-0">
            {menuLinks.map((link, idx) => (
              <Link 
                key={idx} 
                href={link.url}
                className={`text-[13px] font-semibold whitespace-nowrap hover:text-orange-500 transition-colors ${link.highlight ? 'text-red-500 hover:text-red-600' : 'text-foreground'}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
        </div>
      </div>
    </header>
  );
}
