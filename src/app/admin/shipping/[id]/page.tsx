import { db } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { createShippingRate, deleteShippingRate } from "@/app/admin/actions";
import { getFormatPrice } from "@/lib/format";

export default async function AdminShippingZoneDetails({ params }: { params: { id: string } }) {
  const formatPrice = await getFormatPrice();
  
  const zone = await db.shippingZone.findUnique({
    where: { id: params.id },
    include: { rates: true }
  });

  if (!zone) {
    notFound();
  }

  const countriesArr = Array.isArray(zone.countries) ? zone.countries : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/shipping">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{zone.name}</h1>
          <p className="text-muted-foreground text-sm">
            {countriesArr.join(", ")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-background border rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-bold text-lg">Shipping Rates</h2>
            </div>
            
            {zone.rates.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p>No rates configured for this zone.</p>
                <p className="text-sm">Customers in this zone will not be able to check out until you add a rate.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Rate Name</th>
                    <th className="px-6 py-4 font-medium">Condition</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {zone.rates.map(rate => (
                    <tr key={rate.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{rate.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {rate.condition === "NONE" ? "No conditions" :
                         rate.condition === "PRICE" ? `Orders ${rate.minCondition ? `over ${formatPrice(rate.minCondition)}` : ''} ${rate.maxCondition ? `under ${formatPrice(rate.maxCondition)}` : ''}` :
                         `Weight based`}
                      </td>
                      <td className="px-6 py-4 font-medium text-primary">
                        {rate.price === 0 ? "Free" : formatPrice(rate.price)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={async () => {
                          "use server";
                          await deleteShippingRate(rate.id, zone.id);
                        }}>
                          <Button variant="ghost" size="icon" type="submit" className="text-destructive hover:bg-destructive/10 h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <form action={createShippingRate.bind(null, zone.id)} className="bg-background border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Add Rate</h3>
            
            <div>
              <label className="block text-xs font-medium mb-1">Rate Name</label>
              <input name="name" required placeholder="Standard Shipping" className="w-full h-9 px-3 rounded-md border text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Price</label>
              <input type="number" step="0.01" name="price" required placeholder="0.00" className="w-full h-9 px-3 rounded-md border text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Condition</label>
              <select name="condition" className="w-full h-9 px-3 rounded-md border text-sm">
                <option value="NONE">No Conditions</option>
                <option value="PRICE">Based on Order Price</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Min Price (Optional)</label>
                <input type="number" step="0.01" name="minCondition" placeholder="0.00" className="w-full h-9 px-3 rounded-md border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Max Price (Optional)</label>
                <input type="number" step="0.01" name="maxCondition" placeholder="No limit" className="w-full h-9 px-3 rounded-md border text-sm" />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2">Add Rate</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
