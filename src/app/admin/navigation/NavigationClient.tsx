"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { updateNavigation } from "./actions";

type MenuLink = {
  name: string;
  url: string;
  highlight?: boolean;
};

export default function NavigationClient({ initialLinks, pages }: { initialLinks: MenuLink[], pages: any[] }) {
  const [links, setLinks] = useState<MenuLink[]>(initialLinks.length > 0 ? initialLinks : [
    { name: "Home", url: "/" }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddLink = () => {
    setLinks([...links, { name: "New Link", url: "/" }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof MenuLink, value: any) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateNavigation(JSON.stringify(links));
    setIsSaving(false);
    alert("Navigation saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
          <h3 className="font-semibold text-gray-700">Main Menu Items</h3>
          <Button onClick={handleAddLink} variant="outline" size="sm" className="bg-white">
            <Plus className="w-4 h-4 mr-2" /> Add Link
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {links.map((link, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50 group">
              <div className="mt-2 text-gray-400 cursor-grab">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                  <input type="text"
                    value={link.name} 
                    onChange={e => handleChange(index, "name", e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
                
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-gray-500 mb-1">URL or Page</label>
                  <div className="flex gap-2">
                    <input type="text"
                      value={link.url} 
                      onChange={e => handleChange(index, "url", e.target.value)} 
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    />
                    <select 
                      onChange={e => {
                        if(e.target.value) handleChange(index, "url", e.target.value)
                      }}
                      className="bg-white border border-gray-200 rounded-md text-sm px-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                      value=""
                    >
                      <option value="">Insert...</option>
                      <optgroup label="Custom Pages">
                        {pages.map(page => (
                          <option key={page.id} value={`/${page.slug}`}>{page.title}</option>
                        ))}
                      </optgroup>
                      <optgroup label="System">
                        <option value="/">Home</option>
                        <option value="/products">All Products</option>
                        <option value="/login">Login</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={link.highlight || false}
                      onChange={e => handleChange(index, "highlight", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Highlight</span>
                  </label>
                </div>

                <div className="md:col-span-1 flex items-center justify-end mt-6">
                  <Button onClick={() => handleRemoveLink(index)} variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {links.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Your menu is empty. Add a link to get started.
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#008060] hover:bg-[#006e52]">
            <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Navigation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
