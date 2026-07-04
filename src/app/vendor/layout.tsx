import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Store, Package, ShoppingCart, Settings, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { stores: true }
  });

  if (!user || user.stores.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-white p-8 rounded-xl border shadow-sm max-w-md w-full">
          <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">You do not have a vendor store registered to this account.</p>
          <Button asChild className="w-full">
            <Link href="/">Return to Storefront</Link>
          </Button>
        </div>
      </div>
    );
  }

  const store = user.stores[0];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Store className="h-5 w-5 text-indigo-600" /> Vendor Portal
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">{store.name}</span>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/store/${store.slug}`} target="_blank">
              View Store <ExternalLink className="h-3 w-3 ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block w-64 shrink-0 bg-white border-r flex flex-col z-10">
          <div className="p-4 space-y-1">
            <Link href="/vendor" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-gray-900">
              <Store className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/vendor/products" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-gray-600">
              <Package className="h-4 w-4" /> My Products
            </Link>
            <Link href="/vendor/orders" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-gray-600">
              <ShoppingCart className="h-4 w-4" /> Orders
            </Link>
            <Link href="/vendor/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-gray-600">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </div>
          <div className="mt-auto p-4 border-t">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-red-600">
              <LogOut className="h-4 w-4" /> Exit Portal
            </Link>
          </div>
        </div>
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
