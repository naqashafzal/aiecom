"use client";

import { useState } from "react";
import { AutoLink } from "@prisma/client";
import { Plus, Pencil, Trash2, Check, X, AlertCircle } from "lucide-react";
import { createAutoLink, updateAutoLink, deleteAutoLink } from "@/actions/admin/autolinks";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AutoLinksClient({ initialLinks }: { initialLinks: AutoLink[] }) {
  const [links, setLinks] = useState<AutoLink[]>(initialLinks);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({ keyword: "", url: "", isActive: true });

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      if (editingId) {
        const updated = await updateAutoLink(editingId, formData);
        setLinks(links.map(l => l.id === editingId ? updated : l));
        setEditingId(null);
      } else {
        const created = await createAutoLink(formData);
        setLinks([created, ...links]);
        setIsAdding(false);
      }
      setFormData({ keyword: "", url: "", isActive: true });
      router.refresh();
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this auto link?")) return;
    try {
      setLoading(true);
      await deleteAutoLink(id);
      setLinks(links.filter(l => l.id !== id));
      router.refresh();
    } catch (e: any) {
      alert("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (link: AutoLink) => {
    setEditingId(link.id);
    setFormData({ keyword: link.keyword, url: link.url, isActive: link.isActive });
    setIsAdding(false);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ keyword: "", url: "", isActive: true });
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h2 className="text-xl font-bold">Auto Internal Links</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage keywords that automatically link to specific URLs.</p>
        </div>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ keyword: "", url: "", isActive: true }); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Link
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="bg-white border p-6 rounded-2xl shadow-sm space-y-4 animate-in fade-in zoom-in duration-300">
          <h3 className="font-bold text-lg mb-4">
            {isAdding ? "Add New Auto Link" : "Edit Auto Link"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Keyword</label>
              <input
                type="text"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                placeholder="e.g. download manager"
                className="w-full bg-background border p-2 rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Target URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g. /software/idm"
                className="w-full bg-background border p-2 rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="accent-primary w-4 h-4 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={loading || !formData.keyword || !formData.url}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button onClick={cancelEdit} disabled={loading} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 font-semibold text-muted-foreground">Keyword</th>
              <th className="p-4 font-semibold text-muted-foreground">URL</th>
              <th className="p-4 w-24 font-semibold text-muted-foreground">Status</th>
              <th className="p-4 w-32 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {links.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground font-medium">
                  No auto links created yet.
                </td>
              </tr>
            ) : (
              links.map((link) => (
                <tr key={link.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-semibold">{link.keyword}</td>
                  <td className="p-4 text-muted-foreground font-mono text-xs">{link.url}</td>
                  <td className="p-4">
                    {link.isActive ? (
                      <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center w-fit gap-1 text-xs font-bold"><Check className="w-3 h-3"/> Active</span>
                    ) : (
                      <span className="text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center w-fit gap-1 text-xs font-bold"><X className="w-3 h-3"/> Inactive</span>
                    )}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <Button onClick={() => startEdit(link)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(link.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
