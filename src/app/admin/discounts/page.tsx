import { db } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFormatPrice } from "@/lib/format";
import { deleteCoupon } from "@/app/admin/actions";

export default async function AdminDiscountsPage() {
  const formatPrice = await getFormatPrice();
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>
          <p className="text-muted-foreground mt-1">Manage promo codes and automatic discounts.</p>
        </div>
        <Button asChild>
          <Link href="/admin/discounts/new">
            <Plus className="mr-2 h-4 w-4" /> Create Discount
          </Link>
        </Button>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium text-center">Usage</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {coupon.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                      coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {coupon.isActive ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}% off` :
                     coupon.type === "FIXED" ? `${formatPrice(coupon.value)} off` :
                     "Free Shipping"}
                  </td>
                  <td className="px-6 py-4 text-center text-muted-foreground">
                    {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "used"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={async () => {
                      "use server";
                      await deleteCoupon(coupon.id);
                    }}>
                      <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No discounts created yet.
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
