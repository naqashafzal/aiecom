"use client";

import { useState } from "react";
import { Upload, ShoppingBag, Database, ArrowRight, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importProductsCsv, deleteAllCatalog, analyzeCsv, syncShopifyApi } from "./actions";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function MigrationClient({
  savedStoreUrl = "",
  savedAccessToken = "",
  savedClientId = "",
  savedClientSecret = "",
}: {
  savedStoreUrl?: string;
  savedAccessToken?: string;
  savedClientId?: string;
  savedClientSecret?: string;
}) {
  const [activeTab, setActiveTab] = useState<"shopify" | "shopify_api" | "woo" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; count?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [analysis, setAnalysis] = useState<{ productCount: number; categoryCount: number } | null>(null);
  const [formDataCache, setFormDataCache] = useState<FormData | null>(null);

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setResult(null);
    setAnalysis(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append("platform", activeTab || "shopify");
    setFormDataCache(formData);
    
    try {
      const res = await analyzeCsv(formData);
      if (res.success) {
        setAnalysis({ productCount: res.productCount!, categoryCount: res.categoryCount! });
      } else {
        setResult({ success: false, message: res.message });
      }
    } catch (err: unknown) {
      setResult({ success: false, message: getErrorMessage(err) });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!formDataCache) return;
    setIsUploading(true);
    try {
      const res = await importProductsCsv(formDataCache);
      setResult(res);
      if (res.success) {
        setAnalysis(null);
        setFormDataCache(null);
      }
    } catch (err: unknown) {
      setResult({ success: false, message: getErrorMessage(err) });
    } finally {
      setIsUploading(false);
    }
  };

  const handleApiSync = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setResult(null);
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await syncShopifyApi(formData);
      setResult(res);
    } catch (err: unknown) {
      setResult({ success: false, message: getErrorMessage(err) });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you absolutely sure? This will PERMANENTLY delete ALL products, images, and categories. This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await deleteAllCatalog();
      alert(res.message);
    } catch (err: unknown) {
      alert("Failed to delete catalog: " + getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shopify Card */}
        <div 
          onClick={() => setActiveTab("shopify")}
          className={`cursor-pointer bg-background rounded-xl border-2 p-6 transition-all ${
            activeTab === "shopify" ? "border-[#95BF47] shadow-md shadow-[#95BF47]/10" : "border-transparent shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-[#95BF47]/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-[#95BF47]" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Shopify</h3>
              <p className="text-sm text-muted-foreground">Import products, variants, and images.</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#95BF47]" /> Supported via standard product CSV
          </div>
        </div>

        {/* Shopify API Card */}
        <div 
          onClick={() => setActiveTab("shopify_api")}
          className={`cursor-pointer bg-background rounded-xl border-2 p-6 transition-all ${
            activeTab === "shopify_api" ? "border-[#95BF47] shadow-md shadow-[#95BF47]/10" : "border-transparent shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-[#95BF47]/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-[#95BF47]" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Shopify API</h3>
              <p className="text-sm text-muted-foreground">Direct connection via Admin API.</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#95BF47]" /> Recommended: Best fidelity
          </div>
        </div>

        {/* WooCommerce Card */}
        <div 
          onClick={() => setActiveTab("woo")}
          className={`cursor-pointer bg-background rounded-xl border-2 p-6 transition-all ${
            activeTab === "woo" ? "border-[#96588a] shadow-md shadow-[#96588a]/10" : "border-transparent shadow-sm hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-[#96588a]/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-[#96588a]" />
            </div>
            <div>
              <h3 className="text-xl font-bold">WooCommerce</h3>
              <p className="text-sm text-muted-foreground">Import products, categories, and inventory.</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#96588a]" /> Supported via standard product CSV
          </div>
        </div>
      </div>

      {activeTab && (
        <div className="bg-background rounded-xl border shadow-sm p-6 animate-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-2xl font-bold mb-4">
            Import from {activeTab === "shopify" ? "Shopify CSV" : activeTab === "shopify_api" ? "Shopify API" : "WooCommerce CSV"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {activeTab === "shopify_api" 
              ? "Connect directly to your Shopify store via the Admin API to fetch products, exact collections, and full image galleries automatically."
              : `Export your products as a CSV file from your ${activeTab === "shopify" ? "Shopify" : "WooCommerce"} admin, then upload the file below.`}
          </p>

          {activeTab === "shopify_api" ? (
            <form onSubmit={handleApiSync} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Shopify Store URL</label>
                  <input type="text" name="storeUrl" defaultValue={savedStoreUrl} required placeholder="your-store.myshopify.com" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Admin API Access Token</label>
                  <input type="password" name="accessToken" defaultValue={savedAccessToken} placeholder="shpat_..." className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                  <p className="text-xs text-muted-foreground mt-1">Use this if you already generated an Admin API access token.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Client ID</label>
                    <input type="password" name="clientId" defaultValue={savedClientId} placeholder="App client ID" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Client Secret</label>
                    <input type="password" name="clientSecret" defaultValue={savedClientSecret} placeholder="App secret" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-2">
                  <input type="checkbox" id="saveCredentials" name="saveCredentials" value="true" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="saveCredentials" className="text-sm font-medium">Save these credentials for future syncs</label>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-md p-4 text-sm mt-4">
                  <p className="font-semibold mb-1">New to Shopify Authentication in 2026?</p>
                  <p className="text-muted-foreground mb-2">
                    Shopify no longer allows creating Custom Apps directly in your Store Admin. You must:
                  </p>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-1">
                    <li>Go to the <a href="https://partners.shopify.com" target="_blank" className="text-primary hover:underline font-medium">Shopify Partners / Developers Dashboard</a>.</li>
                    <li>Create a new Custom App and select your store.</li>
                    <li>Under <b>API Access</b>, check both <code className="bg-muted px-1 py-0.5 rounded text-xs">read_products</code> and <code className="bg-muted px-1 py-0.5 rounded text-xs">read_inventory</code>.</li>
                    <li>Copy and paste your <b>Client ID</b> and <b>Client Secret</b> here.</li>
                  </ol>
                </div>
              </div>
              
              {result && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${result.success ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"}`}>
                  {result.success ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                  <div>
                    <h4 className="font-semibold">{result.success ? "Sync Successful" : "Sync Failed"}</h4>
                    <p className="text-sm mt-1">{result.message}</p>
                    {result.count !== undefined && <p className="text-sm font-bold mt-1">{result.count} products synced.</p>}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isUploading} size="lg" className="w-full sm:w-auto">
                  {isUploading ? "Syncing API..." : "Start API Sync"}
                  {!isUploading && <Zap className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          ) : (
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="border-2 border-dashed rounded-xl p-12 text-center relative hover:bg-muted/50 transition-colors">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-base font-medium mb-1">Click to browse or drag your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-4">Must be a valid CSV export file.</p>
              <input 
                type="file" 
                name="csvFile" 
                accept=".csv" 
                required
                onChange={() => { setResult(null); setAnalysis(null); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <Button type="button" variant="secondary" className="pointer-events-none">
                Select File
              </Button>
            </div>

            {analysis && !result?.success && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
                <h3 className="text-lg font-bold mb-2">Analysis Complete</h3>
                <p className="text-muted-foreground mb-6">
                  We found <strong className="text-foreground">{analysis.productCount}</strong> products and <strong className="text-foreground">{analysis.categoryCount}</strong> unique categories in your file.
                </p>
                <div className="flex justify-center gap-4">
                  <Button type="button" variant="outline" onClick={() => setAnalysis(null)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleConfirmImport} disabled={isUploading}>
                    {isUploading ? "Importing Data..." : "Confirm & Import Now"}
                    {!isUploading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {result && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${result.success ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"}`}>
                {result.success ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                <div>
                  <h4 className="font-semibold">{result.success ? "Import Successful" : "Import Failed"}</h4>
                  <p className="text-sm mt-1">{result.message}</p>
                  {result.count && <p className="text-sm font-bold mt-1">{result.count} products imported.</p>}
                </div>
              </div>
            )}

            {!analysis && !result?.success && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isUploading} size="lg" className="w-full sm:w-auto">
                  {isUploading ? "Analyzing..." : `Analyze ${activeTab === 'shopify' ? 'Shopify' : 'WooCommerce'} File`}
                  {!isUploading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            )}
          </form>
          )}
        </div>
      )}

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-destructive/20">
        <div className="bg-destructive/5 rounded-xl border border-destructive/20 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Danger Zone
              </h3>
              <p className="text-sm text-destructive/80 mt-1">
                Permanently delete all products, categories, and image mappings. This is useful for clearing dummy data or resetting before a fresh migration.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAll}
              disabled={isDeleting}
              className="shrink-0 font-semibold shadow-sm"
            >
              {isDeleting ? "Deleting..." : "Erase Entire Catalog"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
