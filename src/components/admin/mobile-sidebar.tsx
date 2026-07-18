"use client";

import { useAdminStore } from "@/store/useAdminStore";
import { AdminSidebar } from "./sidebar";
import { X } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
  const { isMobileSidebarOpen, closeMobileSidebar } = useAdminStore();
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  if (!isMobileSidebarOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={closeMobileSidebar}
      />
      <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 md:hidden flex flex-col shadow-xl animate-in slide-in-from-left-4 duration-200">
        <div className="flex items-center justify-between h-14 px-4 border-b shrink-0">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2 text-gray-900">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-black">A</span>
            </div>
            ZS Decor<span className="text-gray-400 font-normal">Admin</span>
          </div>
          <button onClick={closeMobileSidebar} className="text-gray-500 hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <AdminSidebar />
        </div>
      </div>
    </>
  );
}
