import { db } from "@/lib/prisma";
import { Store, MoreHorizontal, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminVendorsPage() {
  const vendors = await db.store.findMany({
    include: {
      owner: true,
      _count: {
        select: { products: true, orderItems: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1">Manage partner stores and multi-vendor accounts.</p>
        </div>
        <Link href="/admin/vendors/new">
          <Button className="rounded-full shadow-sm">
            Invite Vendor
          </Button>
        </Link>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Store Name</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium text-center">Products</th>
                <th className="px-6 py-4 font-medium text-center">Rating</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 border border-indigo-500/20">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold">{vendor.name}</span>
                      <a href={`/store/${vendor.slug}`} className="text-xs text-primary flex items-center hover:underline mt-0.5">
                        View Storefront <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {vendor.owner?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {vendor._count.products} listed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-amber-500">
                    ★ {vendor.rating.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-muted-foreground">-</span>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No vendors onboarded</h3>
                    <p className="text-muted-foreground mt-1">Invite your first partner to start selling.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
