"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, ChevronDown, Menu, Smartphone } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";

import { StoreLogo } from "@/components/storefront/StoreLogo";

export function MarketplaceNavbar({ 
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
    <div className="w-full">
      {/* Top Mini-bar removed for production readiness */}

      {/* Main Navbar */}
      <header className="bg-[#f85606] text-white py-3 md:py-4 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col gap-3">
          
          {/* Top Row */}
          <div className="flex items-center justify-between gap-4 md:gap-8">
          
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
            <StoreLogo 
              className="text-white" 
              logoUrl={logoUrl}
              logoText={logoText || "MARKETHUB"}
              logoHeight={logoHeight}
              logoAccent={logoAccent || "#fde047"}
            />
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl bg-white rounded-sm overflow-hidden flex-row items-center h-10 shadow-inner">
            <select className="bg-gray-100 text-gray-700 h-full px-3 text-xs border-r border-gray-300 outline-none cursor-pointer hidden lg:block">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home & Garden</option>
            </select>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const q = formData.get("q");
                if (q) window.location.href = `/products?search=${encodeURIComponent(q as string)}`;
              }}
              className="flex flex-1 h-full"
            >
              <input 
                type="text" 
                name="q"
                placeholder="Search in Marketplace..." 
                className="flex-1 h-full px-4 text-black text-sm outline-none"
              />
              <button type="submit" className="bg-[#ffe1d2] text-[#f85606] h-full px-5 hover:bg-[#ffcfb9] transition-colors flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/login" className="hidden md:flex items-center gap-2 hover:text-gray-200 transition-colors">
              <User className="w-6 h-6" />
              <div className="flex flex-col items-start text-xs text-left">
                <span className="opacity-80">Hello, Sign in</span>
                <span className="font-bold flex items-center">Account & Orders <ChevronDown className="w-3 h-3 ml-1" /></span>
              </div>
            </Link>

            <button className="flex items-center gap-2 relative hover:text-gray-200 transition-colors" onClick={toggleCart}>
              <div className="relative">
                <ShoppingCart className="w-7 h-7" />
                {mounted && getCartCount() > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-yellow-400 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </div>
              <span className="font-bold hidden md:block mt-2">Cart</span>
            </button>
          </div>
          </div>
          
          {/* Mobile Search Row */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const q = formData.get("q");
              if (q) window.location.href = `/products?search=${encodeURIComponent(q as string)}`;
            }}
            className="md:hidden flex w-full bg-white rounded-sm overflow-hidden flex-row items-center h-10 shadow-inner"
          >
            <input 
              type="text" 
              name="q"
              placeholder="Search in Marketplace..." 
              className="flex-1 h-full px-4 text-black text-sm outline-none"
            />
            <button type="submit" className="bg-[#ffe1d2] text-[#f85606] h-full px-5 hover:bg-[#ffcfb9] transition-colors flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
          </form>

        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white text-black px-4 py-4 flex flex-col gap-4 border-b border-gray-200 shadow-md absolute w-full left-0 z-40">
          <div className="font-bold text-gray-800 mb-2">Categories</div>
          {menuLinks && menuLinks.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.url} 
              className={`text-sm pb-2 border-b border-gray-100 ${link.highlight ? 'text-[#f85606] font-bold' : 'text-gray-700'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/login" className="text-sm flex items-center gap-2 mt-2 text-gray-700 hover:text-[#f85606]" onClick={() => setIsMobileMenuOpen(false)}>
            <User className="w-4 h-4" /> Account & Orders
          </Link>
        </div>
      )}

      {/* Menu Links Bar (optional) */}
      {menuLinks && menuLinks.length > 0 && (
        <div className="bg-white border-b border-gray-200 hidden md:block shadow-sm">
          <div className="max-w-[1200px] mx-auto px-4 flex items-center gap-6 py-2">
            {menuLinks.map((link, idx) => (
              <Link 
                key={idx} 
                href={link.url} 
                className={`text-sm hover:text-[#f85606] transition-colors ${link.highlight ? 'text-[#f85606] font-semibold' : 'text-gray-700'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
