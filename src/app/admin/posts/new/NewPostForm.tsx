"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Loader2 } from "lucide-react";
import { generateAiBlogPost } from "../../ai-agents/ai-actions";

export function NewPostForm({ createPostAction, aiEnabled }: { createPostAction: (formData: FormData) => Promise<void>, aiEnabled: boolean }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!title) {
      alert("Please enter a title/topic first.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await generateAiBlogPost(title);
      if (res.success) {
        setContent(res.content);
        setExcerpt(res.excerpt);
        if (!slug) {
          setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
      } else {
        alert(res.error || "Failed to generate blog post.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form action={createPostAction} className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="text-sm font-medium text-gray-900">Title</label>
            {aiEnabled && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="h-7 text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
              >
                {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                {isGenerating ? "Writing..." : "Write with AI"}
              </Button>
            )}
          </div>
          <input 
            type="text" 
            id="title"
            name="title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. 10 Tips for E-commerce Success"
            className="w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium text-gray-900">URL Slug</label>
          <input 
            type="text" 
            id="slug"
            name="slug" 
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="e.g. 10-tips-for-ecommerce-success"
            className="w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="excerpt" className="text-sm font-medium text-gray-900">Excerpt (Short Summary)</label>
        <textarea 
          id="excerpt"
          name="excerpt" 
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="A brief summary of the article..."
          className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-gray-900">Content</label>
        <textarea 
          id="content"
          name="content" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={12}
          placeholder="Write your blog post content here (Markdown or HTML)..."
          className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5 font-mono text-sm resize-y"
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input 
          type="checkbox" 
          id="published" 
          name="published" 
          className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
        />
        <label htmlFor="published" className="text-sm font-medium text-gray-900">
          Publish immediately
        </label>
      </div>

      <div className="pt-4 border-t flex justify-end gap-3">
        <Link href="/admin/posts">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={isGenerating} className="bg-[#1a1a1a] hover:bg-black text-white">
          Save Post
        </Button>
      </div>
    </form>
  );
}
