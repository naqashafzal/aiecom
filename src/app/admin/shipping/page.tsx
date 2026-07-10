import { db } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Globe, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteShippingZone } from "@/app/admin/actions";

export default async function AdminShippingPage() {
  const zones = await db.shippingZone.findMany({
    include: {
      rates: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping Zones</h1>
          <p className="text-muted-foreground mt-1">Manage where you ship and how much you charge.</p>
        </div>
        <Button asChild>
          <Link href="/admin/shipping/new">
            <Plus className="mr-2 h-4 w-4" /> Create Zone
          </Link>
        </Button>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Zone Name</th>
                <th className="px-6 py-4 font-medium">Countries</th>
                <th className="px-6 py-4 font-medium text-center">Rates Configured</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {zones.map((zone) => {
                const countriesArr = Array.isArray(zone.countries) ? zone.countries : [];
                return (
                  <tr key={zone.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {zone.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {countriesArr.slice(0, 5).map((c: any, i: number) => (
                          <span key={i} className="bg-muted px-2 py-0.5 rounded text-xs">{c}</span>
                        ))}
                        {countriesArr.length > 5 && (
                          <span className="bg-muted px-2 py-0.5 rounded text-xs">+{countriesArr.length - 5} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium text-xs">
                        {zone.rates.length} Rates
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link href={`/admin/shipping/${zone.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <form action={async () => {
                          "use server";
                          await deleteShippingZone(zone.id);
                        }}>
                          <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:bg-destructive/10 h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {zones.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No shipping zones created yet. Create one to enable checkout!
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
