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
  LayoutTemplate,
  FileText,
  Bot,
  Import,
  Star,
  Truck,
  Mail
} from "lucide-react";

const mainNavItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Orders", href: "/admin/orders", icon: Inbox },
  { name: "Products", href: "/admin/products", icon: Tag },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Vendors", href: "/admin/vendors", icon: Store },
  { name: "Blog Posts", href: "/admin/posts", icon: FileText },
  { name: "Custom Pages", href: "/admin/pages", icon: FileText },
  { name: "Messages", href: "/admin/messages", icon: Mail },
  { name: "Online Store", href: "/admin/online-store", icon: LayoutTemplate },
  { name: "Navigation", href: "/admin/navigation", icon: LayoutTemplate },
  { name: "Footer Layout", href: "/admin/footer", icon: LayoutTemplate },
  { name: "Shipping Settings", href: "/admin/settings/shipping", icon: Truck },
  { name: "AI Workforce", href: "/admin/ai-agents", icon: Bot },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { name: "Plugins", href: "/admin/plugins", icon: Bot },
  { name: "Store Migration", href: "/admin/migration", icon: Import },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full flex flex-col text-gray-700 text-[13px] font-medium pt-3 bg-white">
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
                  ? "bg-gray-100 font-semibold text-gray-900" 
                  : "hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className={`h-4 w-4 ${isActive ? "text-gray-900" : "text-gray-500"}`} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Settings */}
      <div className="p-2 border-t border-gray-100 shrink-0 bg-white">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
            pathname === '/admin/settings' ? "bg-gray-100 font-semibold text-gray-900" : "hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings className={`h-4 w-4 ${pathname === '/admin/settings' ? "text-gray-900" : "text-gray-500"}`} strokeWidth={pathname === '/admin/settings' ? 2.5 : 2} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
