"use client";

import { Bell, Search, Menu, Printer, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

import { useAdminStore } from "@/store/useAdminStore";

interface AdminHeaderProps {
  user?: { name?: string | null; email?: string | null } | null;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { toggleMobileSidebar } = useAdminStore();
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 shrink-0">
      <div className="flex items-center gap-4 w-auto md:w-64 shrink-0">
        <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="md:hidden text-gray-600 hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="font-bold text-xl tracking-tight flex items-center gap-2 text-gray-900">
          {/* ZS Decor Logo */}
          <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center hidden sm:flex">
            <span className="text-white text-xs font-black">A</span>
          </div>
          <span className="hidden sm:inline">ZS Decor</span><span className="text-gray-400 font-normal">Admin</span>
        </div>
      </div>
      
      <div className="flex-1 max-w-2xl px-4 hidden md:block relative">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-9 pl-10 pr-16 rounded-md bg-gray-100 border border-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
          />
          <div className="absolute right-2 top-2 text-[10px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200 group-focus-within:hidden">
            CTRL K
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-auto md:w-64 shrink-0 justify-end">
        <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-500 hover:text-gray-900 hover:bg-gray-100 h-8 w-8">
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
        <div 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="ml-0 sm:ml-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer rounded-md pl-1 pr-1 sm:pr-3 py-1 transition-colors group border border-transparent hover:border-gray-200"
          title="Sign out"
        >
          <div className="h-6 w-6 rounded text-[10px] font-bold bg-black text-white flex items-center justify-center uppercase group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors">
            {user?.name?.[0] || "A"}
          </div>
          <span className="text-xs font-medium truncate max-w-[100px] text-gray-700 group-hover:text-gray-900 hidden sm:inline">{user?.name || "ZS Decor Admin"}</span>
          <LogOut className="h-3 w-3 ml-1 text-gray-400 group-hover:text-destructive hidden sm:inline" />
        </div>
      </div>
    </header>
  );
}
