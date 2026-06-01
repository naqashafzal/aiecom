"use client";

import { Bell, Search, Menu, Printer, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  return (
    <header className="h-14 bg-[#1a1a1a] text-white flex items-center justify-between px-4 z-30 shrink-0">
      <div className="flex items-center gap-4 w-64 shrink-0">
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
          {/* Aura Logo */}
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-black">A</span>
          </div>
          Aura<span className="text-primary font-normal">Admin</span>
        </div>
      </div>
      
      <div className="flex-1 max-w-2xl px-4 hidden md:block relative">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-9 pl-10 pr-16 rounded-md bg-[#2b2b2b] border border-transparent text-sm text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:text-black focus:placeholder-gray-500 transition-colors"
          />
          <div className="absolute right-2 top-2 text-[10px] font-bold text-gray-400 bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-gray-600 group-focus-within:hidden">
            CTRL K
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-64 shrink-0 justify-end">
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10 h-8 w-8">
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10 h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="ml-2 flex items-center gap-2 bg-[#2b2b2b] hover:bg-[#363636] cursor-pointer rounded-md pl-1 pr-3 py-1 transition-colors">
          <div className="h-6 w-6 rounded text-[10px] font-bold bg-primary text-primary-foreground flex items-center justify-center uppercase">
            AA
          </div>
          <span className="text-xs font-medium">Aura Admin</span>
        </div>
      </div>
    </header>
  );
}
