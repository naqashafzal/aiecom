import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createCoupon } from "@/app/admin/actions";

export default function NewDiscountPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/discounts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Discount</h1>
      </div>

      <form action={createCoupon} className="space-y-6">
        <div className="bg-background border rounded-xl p-6 space-y-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Discount Code</label>
              <input 
                name="code" 
                required 
                placeholder="e.g. SUMMER25"
                className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none uppercase"
              />
              <p className="text-xs text-muted-foreground mt-1">Customers will enter this code at checkout.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select 
                  name="type" 
                  required
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Value</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="value" 
                  required 
                  placeholder="e.g. 25"
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background border rounded-xl p-6 space-y-6 shadow-sm">
          <h2 className="font-bold text-lg">Requirements & Limits</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Minimum Order Value (Optional)</label>
              <input 
                type="number" 
                step="0.01"
                name="minOrderValue" 
                placeholder="0.00"
                className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit (Optional)</label>
              <input 
                type="number" 
                name="usageLimit" 
                placeholder="Leave blank for unlimited"
                className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Active Status</label>
              <select 
                name="isActive" 
                className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="true">Active (Customers can use it)</option>
                <option value="false">Draft (Hidden)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/discounts">Cancel</Link>
          </Button>
          <Button type="submit">Save Discount</Button>
        </div>
      </form>
    </div>
  );
}
