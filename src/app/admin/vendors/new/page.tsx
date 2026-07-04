import Link from "next/link";
import { ArrowLeft, Store, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createVendorStore } from "../actions";

export default function NewVendorPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/vendors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Onboard Vendor</h1>
          <p className="text-muted-foreground mt-1">Create a new partner store and assign an owner.</p>
        </div>
      </div>

      <form action={createVendorStore} className="bg-background rounded-xl border shadow-sm p-6 space-y-8">
        
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Store Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="storeName" className="block text-sm font-semibold mb-2">Store Name</label>
              <input id="storeName" name="storeName" type="text" required placeholder="e.g. Acme Electronics" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label htmlFor="storeSlug" className="block text-sm font-semibold mb-2">Store URL Slug</label>
              <input id="storeSlug" name="storeSlug" type="text" required placeholder="e.g. acme-electronics" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-2">Store Description (Optional)</label>
            <textarea id="description" name="description" rows={3} placeholder="A short bio about this vendor..." className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-bold">Owner Information</h2>
          <p className="text-sm text-muted-foreground">The vendor will use this email to log into the vendor portal.</p>
          <div>
            <label htmlFor="ownerEmail" className="block text-sm font-semibold mb-2">Owner Email Address</label>
            <input id="ownerEmail" name="ownerEmail" type="email" required placeholder="vendor@example.com" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none max-w-md" />
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/vendors">Cancel</Link>
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Create Vendor Store
          </Button>
        </div>
      </form>
    </div>
  );
}
