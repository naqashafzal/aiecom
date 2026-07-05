import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await db.category.findUnique({
    where: { id }
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-sm text-muted-foreground mt-1">Update category details below.</p>
        </div>
      </div>

      <div className="bg-background rounded-xl border shadow-sm p-6">
        <form action={async (formData: FormData) => {
          "use server";
          const { updateCategory } = await import('@/app/admin/actions');
          await updateCategory(category.id, formData);
        }} className="space-y-6">
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Category Name</label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                required 
                defaultValue={category.name}
                className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea 
                id="description" 
                name="description" 
                rows={4} 
                defaultValue={category.description || ''}
                className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/categories">Cancel</Link>
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
