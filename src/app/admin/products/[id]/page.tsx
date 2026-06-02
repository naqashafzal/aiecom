import Link from "next/link";
import { ArrowLeft, Upload, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { updateProduct } from "../../actions";
import { notFound } from "next/navigation";
import { ImageUploadPreview } from "@/components/admin/ImageUploadPreview";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await db.category.findMany();
  const product = await db.product.findUnique({
    where: { id },
    include: { images: true, categories: true }
  });

  if (!product) {
    return notFound();
  }

  // Need to bind the product ID to the updateProduct action
  const updateProductWithId = updateProduct.bind(null, product.id);

  const primaryImageUrl = product.images?.[0]?.url;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground mt-1">Update product details for {product.name}.</p>
        </div>
      </div>

      <form action={updateProduct.bind(null, id)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2">Title</label>
              <input id="name" name="name" type="text" required defaultValue={product.name} placeholder="Short sleeve t-shirt" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-semibold mb-2">Description</label>
              <textarea id="description" name="description" required defaultValue={product.description} rows={6} placeholder="Product description..." className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
            </div>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Media</h2>
            <ImageUploadPreview defaultImageUrl={primaryImageUrl} />
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold mb-2">Price ($)</label>
                <input id="price" name="price" type="number" step="0.01" required defaultValue={product.price} placeholder="0.00" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div>
                <label htmlFor="salePrice" className="block text-sm font-semibold mb-2">Compare at price ($) (Optional)</label>
                <input id="salePrice" name="salePrice" type="number" step="0.01" defaultValue={product.salePrice || ''} placeholder="0.00" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Inventory</h2>
            <div>
              <label htmlFor="stock" className="block text-sm font-semibold mb-2">Quantity available</label>
              <input id="stock" name="stock" type="number" required defaultValue={product.stock} placeholder="0" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Status</h2>
            <select id="status" name="status" defaultValue={product.status} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none">
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Organization</h2>
            <div>
              <label htmlFor="categoryIds" className="block text-sm font-semibold mb-2">Product Categories (Hold Ctrl/Cmd to select multiple)</label>
              <select id="categoryIds" name="categoryIds" multiple required defaultValue={product.categories.map(c => c.id)} className="w-full px-3 py-2 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm min-h-[120px]">
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
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
      
    </div>
  );
}
