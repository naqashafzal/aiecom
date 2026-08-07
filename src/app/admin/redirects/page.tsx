import { db } from "@/lib/prisma";
import { processRedirectsXml, deleteRedirect, createManualRedirect } from "./actions";
import { Upload, Plus, Trash2, ArrowRight } from "lucide-react";

export default async function RedirectsPage() {
  const redirects = await db.redirect.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">SEO Redirects</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* XML Uploader */}
        <div className="bg-background rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Smart XML Auto-Matcher</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Upload your 404 links (Sitemap XML or a text file with one URL per line). 
            The system will automatically find the best matching products and save permanent 301 redirects.
          </p>
          
          <form action={processRedirectsXml} className="space-y-4">
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors relative flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Click or drag file to upload</p>
              <p className="text-xs text-muted-foreground">XML or TXT</p>
              <input 
                type="file" 
                name="xmlFile" 
                accept=".xml,.txt" 
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground h-10 rounded-md font-medium hover:bg-primary/90 transition-colors">
              Process File & Auto-Match
            </button>
          </form>
        </div>

        {/* Manual Redirect */}
        <div className="bg-background rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-bold mb-2">Add Manual Redirect</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Create a custom 301 redirect rule manually.
          </p>

          <form action={createManualRedirect} className="space-y-4">
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
            <button type="submit" className="w-full bg-secondary text-secondary-foreground h-10 rounded-md font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Add Redirect
            </button>
          </form>
        </div>
      </div>

      {/* Redirects List */}
      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Active Redirects ({redirects.length})</h2>
        </div>
        
        {redirects.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No redirects found. Upload a file or add one manually.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="font-semibold p-4">Source URL</th>
                  <th className="font-semibold p-4">Destination URL</th>
                  <th className="font-semibold p-4">Type</th>
                  <th className="font-semibold p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {redirects.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-destructive font-medium truncate max-w-[200px]" title={r.sourceUrl}>
                      {r.sourceUrl}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-primary font-medium truncate max-w-[250px]" title={r.destinationUrl}>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {r.destinationUrl}
                      </div>
                    </td>
                    <td className="p-4">
                      {r.isAutomatic ? (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">Auto-Matched</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">Manual</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <form action={async () => {
                        "use server";
                        await deleteRedirect(r.id);
                      }}>
                        <button type="submit" className="text-muted-foreground hover:text-destructive p-1 transition-colors" title="Delete Rule">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
