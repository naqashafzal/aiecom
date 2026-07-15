import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCategory } from "../../actions";
import { ImageUploadPreview } from "@/components/admin/ImageUploadPreview";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Category</h1>
          <p className="text-muted-foreground mt-1">Create a new category to organize your products.</p>
        </div>
      </div>

      <form action={createCategory} className="space-y-6">
        <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
          <ImageUploadPreview label="Category Featured Image" />
          
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-2">Name</label>
            <input id="name" name="name" type="text" required placeholder="e.g. Electronics" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-2">Description (Optional)</label>
            <textarea id="description" name="description" rows={4} placeholder="Description..." className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-background/80 backdrop-blur-md border-t flex justify-end gap-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-40">
          <Button variant="outline" type="button" asChild className="px-6 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent shadow-none">
            <Link href="/admin/categories"><X className="mr-2 h-4 w-4" /> Cancel</Link>
          </Button>
          <Button type="submit" className="px-8 rounded-full shadow-lg shadow-primary/25">
            <Save className="mr-2 h-4 w-4" /> Save Category
          </Button>
        </div>
      </form>
    </div>
  );
}
