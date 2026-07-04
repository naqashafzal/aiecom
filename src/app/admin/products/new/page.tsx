import Link from "next/link";
import { ArrowLeft, Upload, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { createProduct } from "../../actions";
import { ImageUploadPreview } from "@/components/admin/ImageUploadPreview";
import { AiDescriptionButton } from "../../ai-agents/AiDescriptionButton";
import { getStoreCurrency } from "@/lib/format";

export default async function NewProductPage() {
  const categories = await db.category.findMany();
  const stores = await db.store.findMany();
  
  const aiSetting = await db.setting.findUnique({ where: { key: "aiInventoryAgent" } });
  const aiEnabled = aiSetting?.value === "true";
  const storeCurrency = await getStoreCurrency();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-muted-foreground mt-1">Create a new product listing for your store.</p>
        </div>
      </div>

      <form action={createProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2">Title</label>
              <input id="name" name="name" type="text" required placeholder="Short sleeve t-shirt" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-semibold">Description</label>
                {aiEnabled && <AiDescriptionButton titleInputId="name" descInputId="description" />}
              </div>
              <textarea id="description" name="description" required rows={6} placeholder="Product description..." className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
            </div>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Media</h2>
            <ImageUploadPreview />
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold mb-2">Price ({storeCurrency})</label>
                <input id="price" name="price" type="number" step="0.01" required placeholder="0.00" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label htmlFor="salePrice" className="block text-sm font-semibold mb-2">Compare at price ({storeCurrency}) (Optional)</label>
                <input id="salePrice" name="salePrice" type="number" step="0.01" placeholder="0.00" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Inventory</h2>
            <div>
              <label htmlFor="stock" className="block text-sm font-semibold mb-2">Quantity available</label>
              <input id="stock" name="stock" type="number" required placeholder="0" defaultValue="0" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Status</h2>
            <select id="status" name="status" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none">
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Vendor Store</h2>
            <div>
              <label htmlFor="storeId" className="block text-sm font-semibold mb-2">Assign to Store (Optional)</label>
              <select id="storeId" name="storeId" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm">
                <option value="">No Store (First-Party)</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Organization</h2>
            <div>
              <label htmlFor="categoryIds" className="block text-sm font-semibold mb-2">Product Categories (Hold Ctrl/Cmd to select multiple)</label>
              <select id="categoryIds" name="categoryIds" multiple required className="w-full px-3 py-2 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm min-h-[120px]">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="p-1">{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-background/80 backdrop-blur-md border-t flex justify-end gap-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40">
          <Button variant="outline" type="button" asChild className="px-6 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent shadow-none">
            <Link href="/admin/products"><X className="mr-2 h-4 w-4" /> Discard</Link>
          </Button>
          <Button type="submit" className="px-8 rounded-full shadow-lg shadow-primary/25">
            <Save className="mr-2 h-4 w-4" /> Save Product
          </Button>
        </div>
      </form>
      
    </div>
  );
}
