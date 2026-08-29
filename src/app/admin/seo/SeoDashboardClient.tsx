"use client";

import { useState } from "react";
import { generateSeoMetadata, saveSeoMetadata } from "./actions";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle2, AlertTriangle, Edit2, Save, X, Search, Sparkles } from "lucide-react";

type Entity = {
  id: string;
  title?: string;
  name?: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

interface SeoDashboardClientProps {
  products: Entity[];
  categories: Entity[];
  pages: Entity[];
  posts: Entity[];
}

export function SeoDashboardClient({ products, categories, pages, posts }: SeoDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"PRODUCT" | "CATEGORY" | "PAGE" | "POST">("PRODUCT");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState({ metaTitle: "", metaDescription: "" });

  const currentData = {
    PRODUCT: products,
    CATEGORY: categories,
    PAGE: pages,
    POST: posts
  }[activeTab];

  const filteredData = currentData.filter(item => 
    (item.name || item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateHealth = (data: Entity[]) => {
    if (data.length === 0) return 100;
    const itemsWithTags = data.filter(d => d.metaTitle && d.metaDescription).length;
    return Math.round((itemsWithTags / data.length) * 100);
  };

  const overallHealth = Math.round((calculateHealth(products) + calculateHealth(categories) + calculateHealth(pages) + calculateHealth(posts)) / 4);

  const handleGenerate = async (id: string) => {
    setGeneratingIds(prev => new Set(prev).add(id));
    try {
      const res = await generateSeoMetadata(id, activeTab);
      if (res.success) {
        // Handled by revalidatePath in action
      } else {
        alert("Failed to generate SEO metadata: " + res.error);
      }
    } catch (e) {
      alert("An unexpected error occurred.");
    } finally {
      setGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleEditClick = (item: Entity) => {
    setEditingId(item.id);
    setEditForm({
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || ""
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await saveSeoMetadata(editingId, activeTab, editForm.metaTitle, editForm.metaDescription);
      setEditingId(null);
    } catch (e) {
      alert("Failed to save changes.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-background rounded-xl border p-4 flex flex-col justify-center shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-1">Overall SEO Health</div>
          <div className="text-3xl font-bold flex items-center gap-2">
            {overallHealth}% 
            {overallHealth > 80 ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <AlertTriangle className="h-6 w-6 text-yellow-500" />}
          </div>
        </div>
        
        {[
          { label: "Products", score: calculateHealth(products), count: products.length },
          { label: "Categories", score: calculateHealth(categories), count: categories.length },
          { label: "Pages", score: calculateHealth(pages), count: pages.length },
          { label: "Posts", score: calculateHealth(posts), count: posts.length },
        ].map(stat => (
          <div key={stat.label} className="bg-background rounded-xl border p-4 flex flex-col justify-center shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</div>
            <div className="text-2xl font-bold flex items-baseline gap-2">
              {stat.score}% <span className="text-xs font-normal text-muted-foreground">({stat.count} items)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
              <div 
                className={`h-full ${stat.score > 80 ? 'bg-green-500' : stat.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                style={{ width: `${stat.score}%` }} 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background rounded-xl border shadow-sm flex flex-col overflow-hidden">
        {/* Tabs & Search */}
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-muted/50 p-1 rounded-lg">
            {(["PRODUCT", "CATEGORY", "PAGE", "POST"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}s
              </button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or slug..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 h-10 pl-9 pr-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Name / Slug</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium w-full min-w-[300px]">Meta Title & Description</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No items found.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => {
                  const hasTitle = !!item.metaTitle;
                  const hasDesc = !!item.metaDescription;
                  const isHealthy = hasTitle && hasDesc;
                  const isGenerating = generatingIds.has(item.id);
                  const isEditing = editingId === item.id;
                  
                  return (
                    <tr key={item.id} className="group hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground truncate max-w-[200px]">{item.name || item.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">/{item.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isHealthy ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Optimized
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <AlertTriangle className="h-3.5 w-3.5" /> Needs Attention
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        {isEditing ? (
                          <div className="space-y-3 pr-8">
                            <div>
                              <label className="block text-xs font-medium mb-1">Meta Title ({editForm.metaTitle.length}/60)</label>
                              <input 
                                value={editForm.metaTitle} 
                                onChange={e => setEditForm(prev => ({...prev, metaTitle: e.target.value}))} 
                                className="w-full h-8 px-2 rounded border text-xs" 
                                placeholder="Auto-generated if empty..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Meta Description ({editForm.metaDescription.length}/160)</label>
                              <textarea 
                                value={editForm.metaDescription} 
                                onChange={e => setEditForm(prev => ({...prev, metaDescription: e.target.value}))} 
                                className="w-full p-2 rounded border text-xs resize-none h-16" 
                                placeholder="Auto-generated if empty..."
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="pr-8 space-y-1">
                            {hasTitle ? (
                              <div className="text-sm font-semibold text-blue-600 truncate max-w-[400px]" title={item.metaTitle!}>{item.metaTitle}</div>
                            ) : (
                              <div className="text-xs text-muted-foreground italic">Missing Meta Title</div>
                            )}
                            
                            {hasDesc ? (
                              <div className="text-xs text-muted-foreground line-clamp-2 max-w-[400px]" title={item.metaDescription!}>{item.metaDescription}</div>
                            ) : (
                              <div className="text-xs text-muted-foreground italic">Missing Meta Description</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 px-2"><X className="h-4 w-4" /></Button>
                            <Button size="sm" onClick={handleSaveEdit} className="h-8 px-3"><Save className="h-3.5 w-3.5 mr-1.5" /> Save</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleEditClick(item)} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={isHealthy ? "outline" : "default"} 
                              onClick={() => handleGenerate(item.id)} 
                              disabled={isGenerating}
                              className={`h-8 px-3 ${!isHealthy && !isGenerating ? 'shadow-sm shadow-primary/20' : ''}`}
                            >
                              {isGenerating ? (
                                <Bot className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                              )}
                              {isGenerating ? "Generating..." : "AI Auto"}
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
