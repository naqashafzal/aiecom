"use client";

import { useState } from "react";
import { generateSeoMetadata, saveSeoMetadata, bulkGenerateSeoMetadata } from "./actions";
import { saveSettings } from "../actions";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle2, AlertTriangle, Edit2, Save, X, Search, Sparkles, Globe, ShieldAlert, Cpu, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

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
  settings: Record<string, string>;
}

export function SeoDashboardClient({ products, categories, pages, posts, settings }: SeoDashboardClientProps) {
  const router = useRouter();
  const [masterTab, setMasterTab] = useState<"CONTENT" | "GLOBAL" | "TOOLS">("CONTENT");
  
  // Content Tab State
  const [activeTab, setActiveTab] = useState<"PRODUCT" | "CATEGORY" | "PAGE" | "POST">("PRODUCT");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ metaTitle: "", metaDescription: "" });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Global & Tools Tab State
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      if (!res.success) alert("Failed to generate SEO metadata: " + res.error);
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

  const handleBulkGenerate = async () => {
    // Find missing items on current page
    const missingItems = paginatedData.filter(i => !i.metaTitle || !i.metaDescription).map(i => i.id);
    if (missingItems.length === 0) {
      alert("All items on this page already have Meta Tags!");
      return;
    }
    
    setIsBulkGenerating(true);
    setGeneratingIds(prev => new Set([...Array.from(prev), ...missingItems]));
    
    try {
      await bulkGenerateSeoMetadata(missingItems, activeTab);
    } catch (e) {
      alert("Bulk generation encountered an error.");
    } finally {
      setIsBulkGenerating(false);
      setGeneratingIds(prev => {
        const next = new Set(prev);
        missingItems.forEach(id => next.delete(id));
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

  const handleSaveSettings = async (formData: FormData) => {
    setIsSavingSettings(true);
    try {
      await saveSettings(formData);
      router.refresh();
      alert("Settings saved successfully!");
    } catch (e) {
      alert("Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Master Tabs */}
      <div className="flex bg-muted/50 p-1 rounded-lg w-full max-w-2xl">
        <button
          onClick={() => setMasterTab("CONTENT")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
            masterTab === "CONTENT" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Edit2 className="h-4 w-4" /> Content SEO
        </button>
        <button
          onClick={() => setMasterTab("GLOBAL")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
            masterTab === "GLOBAL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Globe className="h-4 w-4" /> Global Settings
        </button>
        <button
          onClick={() => setMasterTab("TOOLS")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
            masterTab === "TOOLS" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          <Cpu className="h-4 w-4" /> AI Engine Tools
        </button>
      </div>

      {masterTab === "CONTENT" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
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
              <div className="flex gap-2">
                <div className="flex bg-muted/50 p-1 rounded-lg">
                  {(["PRODUCT", "CATEGORY", "PAGE", "POST"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      }`}
                    >
                      {tab.charAt(0) + tab.slice(1).toLowerCase()}s
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={handleBulkGenerate} 
                  disabled={isBulkGenerating}
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2 hidden lg:flex"
                >
                  <Sparkles className="h-4 w-4" /> 
                  {isBulkGenerating ? "Generating..." : "Bulk AI Generate Page"}
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search by name or slug..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
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
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        No items found on this page.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map(item => {
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
                          <td className="px-6 py-4 whitespace-normal min-w-[350px]">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-muted/20">
                <div>
                  Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} items
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {masterTab === "GLOBAL" && (
        <form action={handleSaveSettings} className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><Globe className="h-5 w-5 text-blue-500" /> Global Site SEO</h2>
            <p className="text-sm text-muted-foreground mt-1">Configure your default metadata. These are used when a specific page doesn't have custom SEO tags.</p>
          </div>

          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-sm font-medium mb-1">Global Site Name</label>
              <input type="text" name="seo_site_name" defaultValue={settings.seo_site_name || settings.storeName || ""} placeholder="e.g. ZS Decor Premium" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
              <p className="text-xs text-muted-foreground mt-1">Appended to page titles (e.g., "Product Name | Site Name").</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Default Meta Description</label>
              <textarea name="seo_default_description" defaultValue={settings.seo_default_description || ""} rows={3} placeholder="We sell premium goods worldwide..." className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Global OpenGraph Image URL</label>
              <input type="text" name="seo_og_image" defaultValue={settings.seo_og_image || ""} placeholder="https://..." className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
              <p className="text-xs text-muted-foreground mt-1">The default image shown when your site is shared on iMessage, WhatsApp, Twitter, etc.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Twitter Handle</label>
              <input type="text" name="seo_twitter_handle" defaultValue={settings.seo_twitter_handle || ""} placeholder="@yourstore" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button type="submit" disabled={isSavingSettings}>
              {isSavingSettings ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Global Settings</>}
            </Button>
          </div>
        </form>
      )}

      {masterTab === "TOOLS" && (
        <form action={handleSaveSettings} className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><Cpu className="h-5 w-5 text-purple-500" /> AI Engine & Crawler Tools</h2>
            <p className="text-sm text-muted-foreground mt-1">Advanced settings designed for LLM Scrapers (like OpenAI SearchGPT) and traditional web crawlers.</p>
          </div>

          <div className="space-y-8 max-w-3xl">
            
            <div className="border rounded-xl p-5 space-y-4 bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary flex items-center gap-2"><Sparkles className="h-4 w-4" /> Structured Data (JSON-LD) Injector</h3>
                  <p className="text-xs text-muted-foreground mt-1">Automatically generates and injects rich WebSite and Organization schema into your HTML.</p>
                </div>
                <select key={settings.seo_jsonld_enabled} name="seo_jsonld_enabled" defaultValue={settings.seo_jsonld_enabled || "true"} className="h-9 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Why enable this?</strong> AI Search Engines look for JSON-LD specifically to understand your site's structure quickly without parsing HTML visually.
              </p>
            </div>

            <div className="border rounded-xl p-5 space-y-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-orange-500" /> Dynamic Robots.txt Editor</h3>
                <p className="text-xs text-muted-foreground mt-1">Override your site's automatic robots.txt file to block or allow specific crawlers (e.g. ChatGPT-User, CCBot).</p>
              </div>
              
              <textarea 
                name="seo_robots_txt" 
                defaultValue={settings.seo_robots_txt || "User-agent: *\nAllow: /\n\n# Sitemap automatically added"} 
                rows={8} 
                className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-xs font-mono" 
              />
              <p className="text-xs text-muted-foreground">The system will automatically append your sitemap URL to the bottom of this file.</p>
            </div>

          </div>

          <div className="pt-4 border-t">
            <Button type="submit" disabled={isSavingSettings}>
              {isSavingSettings ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Tools Settings</>}
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}
