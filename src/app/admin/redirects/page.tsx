import { db } from "@/lib/prisma";
import { deleteRedirect } from "./actions";
import { Trash2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { XMLUploaderForm, ManualRedirectForm } from "./ClientForms";
import Link from "next/link";

export default async function RedirectsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 20;

  const [redirects, totalCount] = await Promise.all([
    db.redirect.findMany({
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    db.redirect.count()
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">SEO Redirects</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* XML Uploader */}
        <div className="bg-background rounded-xl border shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-2">Smart XML Auto-Matcher</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Upload your 404 links (Sitemap XML, CSV, or a text file). 
            The system will automatically find the best matching products and save permanent 301 redirects.
          </p>
          <div className="flex-1">
            <XMLUploaderForm />
          </div>
        </div>

        {/* Manual Redirect */}
        <div className="bg-background rounded-xl border shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-2">Add Manual Redirect</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Create a custom 301 redirect rule manually.
          </p>
          <div className="flex-1">
            <ManualRedirectForm />
          </div>
        </div>
      </div>

      {/* Redirects List */}
      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Active Redirects ({totalCount})</h2>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
            </div>
            <div className="flex items-center gap-2">
              <Link 
                href={`/admin/redirects?page=${Math.max(1, currentPage - 1)}`}
                className={`flex items-center justify-center w-8 h-8 rounded-md border bg-background hover:bg-muted transition-colors ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              
              <div className="text-sm font-medium px-2">
                Page {currentPage} of {totalPages}
              </div>

              <Link 
                href={`/admin/redirects?page=${Math.min(totalPages, currentPage + 1)}`}
                className={`flex items-center justify-center w-8 h-8 rounded-md border bg-background hover:bg-muted transition-colors ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
