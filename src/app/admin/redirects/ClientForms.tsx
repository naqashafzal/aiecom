"use client";

import { useState } from "react";
import { processRedirectsXml, createManualRedirect } from "./actions";
import { Upload, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function XMLUploaderForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      const res = await processRedirectsXml(formData);
      
      if (res.success) {
        setMessage({ type: "success", text: `Scanned ${res.total} URLs. Successfully auto-matched ${res.count} products! (Unmatched URLs were skipped safely)` });
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to process file." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors relative flex flex-col items-center justify-center bg-background">
        <Upload className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm font-medium mb-1">Click or drag file to upload</p>
        <p className="text-xs text-muted-foreground">XML, CSV, or TXT</p>
        <input 
          type="file" 
          name="xmlFile" 
          accept=".xml,.txt,.csv" 
          required
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-primary text-primary-foreground h-10 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : "Process File & Auto-Match"}
      </button>
    </form>
  );
}

export function ManualRedirectForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createManualRedirect(formData);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">Broken Link (Source)</label>
        <input 
          type="text" 
          name="sourceUrl" 
          required
          placeholder="e.g. /old-category/blue-shoes" 
          className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" 
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Destination</label>
        <input 
          type="text" 
          name="destinationUrl" 
          required
          placeholder="e.g. /products/nike-blue-shoes" 
          className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" 
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-secondary text-secondary-foreground h-10 rounded-md font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> {loading ? "Adding..." : "Add Redirect"}
      </button>
    </form>
  );
}
