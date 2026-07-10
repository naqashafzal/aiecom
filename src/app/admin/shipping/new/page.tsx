import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createShippingZone } from "@/app/admin/actions";

export default function NewShippingZonePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/shipping">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Shipping Zone</h1>
      </div>

      <form action={createShippingZone} className="space-y-6">
        <div className="bg-background border rounded-xl p-6 space-y-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zone Name</label>
              <input 
                name="name" 
                required 
                placeholder="e.g. North America, Domestic, Europe"
                className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Customers won't see this. It's for your organization.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Countries</label>
              <input 
                name="countries" 
                required
                placeholder="e.g. US, CA, GB, PK"
                className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a comma-separated list of 2-letter Country Codes (e.g., PK for Pakistan, US for United States). 
                If a customer checks out from one of these countries, they will see the rates attached to this zone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/shipping">Cancel</Link>
          </Button>
          <Button type="submit">Create Zone</Button>
        </div>
      </form>
    </div>
  );
}
