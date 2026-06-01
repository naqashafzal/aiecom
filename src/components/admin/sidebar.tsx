"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Inbox, 
  Tag, 
  Tags,
  Users, 
  BarChart2, 
  Settings, 
  Store,
  LayoutTemplate
} from "lucide-react";

const mainNavItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Orders", href: "/admin/orders", icon: Inbox },
  { name: "Products", href: "/admin/products", icon: Tag },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Vendors", href: "/admin/vendors", icon: Store },
  { name: "Online Store", href: "/admin/online-store", icon: LayoutTemplate },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full flex flex-col text-[#303030] text-[13px] font-medium pt-3">
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-20 no-scrollbar">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors ${
                isActive 
                  ? "bg-black/5 font-semibold text-black" 
                  : "hover:bg-black/5 hover:text-black"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className={`h-4 w-4 ${isActive ? "text-black" : "text-[#5c5f62]"}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Settings */}
      <div className="p-2 border-t border-black/5 absolute bottom-0 w-64 bg-[#ebebeb]">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
            pathname === '/admin/settings' ? "bg-black/5 font-semibold text-black" : "hover:bg-black/5 hover:text-black"
          }`}
        >
          <Settings className={`h-4 w-4 ${pathname === '/admin/settings' ? "text-black" : "text-[#5c5f62]"}`} strokeWidth={pathname === '/admin/settings' ? 2.5 : 2} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
