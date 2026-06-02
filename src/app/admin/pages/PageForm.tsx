"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { createPage, updatePage } from "./actions";

export default function PageForm({ initialData }: { initialData?: any }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [isLoading, setIsLoading] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!initialData) {
      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const action = initialData ? updatePage.bind(null, initialData.id) : createPage;

  return (
    <form action={async (formData) => {
      setIsLoading(true);
      await action(formData);
    }} className="space-y-6 max-w-4xl">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages">
            <Button type="button" variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">{initialData ? "Edit Page" : "Create New Page"}</h1>
        </div>
        <Button type="submit" disabled={isLoading} className="bg-[#008060] hover:bg-[#006e52]">
          <Save className="w-4 h-4 mr-2" /> {isLoading ? "Saving..." : "Save Page"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <input type="text" name="title" value={title} onChange={handleTitleChange} placeholder="e.g., About Us" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content (HTML allowed)</label>
              <textarea 
                name="content" 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                className="w-full h-96 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="<h1>Welcome to our store</h1><p>Here is our story...</p>"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
            <h3 className="font-semibold border-b pb-2">Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug</label>
              <input type="text" name="slug" value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g., about-us" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
              <p className="text-xs text-gray-500 mt-1">Will be available at /{slug || "slug"}</p>
            </div>
            <div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isPublished"
                  value="true"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#008060] focus:ring-[#008060]"
                />
                <span className="text-sm font-medium">Published (Visible to customers)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
