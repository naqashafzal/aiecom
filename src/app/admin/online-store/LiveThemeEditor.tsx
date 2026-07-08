"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  Smartphone, 
  ChevronLeft, 
  MoreHorizontal, 
  Eye, 
  GripVertical,
  Type,
  ImageIcon,
  LayoutGrid,
  Download,
  Upload,
  MenuSquare
} from "lucide-react";
import Link from "next/link";
import { updateThemeSettings, importThemeSettings } from "./actions";
import { ThemeBlockEditorClient } from "./ThemeBlockEditorClient";
import { 
  AliExpressThemeSchema, defaultAliExpressConfig,
  ElegantThemeSchema, defaultElegantConfig,
  MarketplaceThemeSchema, defaultMarketplaceConfig
} from "@/lib/themeSchemas";

import { useRouter } from "next/navigation";

const UrlInputWithUpload = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) onChange(data.url);
      else alert("Upload failed: " + data.error);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      <input 
        type="url" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm min-w-0"
        placeholder={placeholder}
      />
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
      <button 
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="shrink-0 px-3 border border-[#c9cccf] rounded bg-[#f6f6f7] hover:bg-[#e1e3e5] text-[#202223] text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default function LiveThemeEditor({ initialSettings, categories = [] }: { initialSettings: Record<string, string>, categories?: any[] }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sections" | "theme_settings" | "app_embeds">("sections");
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = async (theme: string) => {
    setSettings(prev => ({ ...prev, "storefront_active_theme": theme }));
    const formData = new FormData();
    Object.entries({ ...settings, "storefront_active_theme": theme }).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    setIsSaving(true);
    await updateThemeSettings(formData);
    
    if (iframeRef.current) {
      const url = new URL(iframeRef.current.src, window.location.origin);
      url.searchParams.set("t", Date.now().toString());
      iframeRef.current.src = url.toString();
    }
    setIsSaving(false);
    router.refresh();
    setActiveSection(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    Object.entries(settings).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    await updateThemeSettings(formData);
    
    if (iframeRef.current) {
      const url = new URL(iframeRef.current.src, window.location.origin);
      url.searchParams.set("t", Date.now().toString());
      iframeRef.current.src = url.toString(); // Force bypass browser cache
    }
    
    setIsSaving(false);
    router.refresh();
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "aura_theme_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setMenuOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedSettings = JSON.parse(event.target?.result as string);
        const formData = new FormData();
        formData.append("importedSettings", JSON.stringify(importedSettings));
        
        setIsSaving(true);
        await importThemeSettings(formData);
        
        setSettings(prev => ({ ...prev, ...importedSettings }));
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
        setIsSaving(false);
        setMenuOpen(false);
        alert("Theme imported successfully!");
      } catch (err) {
        setIsSaving(false);
        alert("Invalid theme file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const activeTheme = settings["storefront_active_theme"] || "aliexpress";

  const allSections = {
    aliexpress: [
      { id: "navigation", name: "Navigation Menu", icon: MenuSquare },
      { id: "announcement", name: "Announcement bar", icon: Type },
      { id: "hero", name: "Summer Sale Banner", icon: ImageIcon },
      { id: "deals", name: "Today's Deals", icon: LayoutGrid },
      { id: "new_arrivals", name: "New Arrivals", icon: LayoutGrid },
      { id: "more_to_love", name: "More to love", icon: LayoutGrid },
      { id: "features", name: "Value Props", icon: LayoutGrid },
      { id: "products", name: "Latest Products", icon: LayoutGrid },
      { id: "stores", name: "Premium Stores", icon: LayoutGrid },
    ],
    elegant: [
      { id: "navigation", name: "Navigation Menu", icon: MenuSquare },
      { id: "elegant_categories", name: "Top Categories", icon: LayoutGrid },
      { id: "elegant_hero", name: "Hero Banner", icon: ImageIcon },
      { id: "elegant_best_sellers", name: "Best Sellers", icon: LayoutGrid },
      { id: "elegant_featured_plants", name: "Featured Plants", icon: LayoutGrid },
      { id: "elegant_new_arrivals", name: "New Arrivals", icon: LayoutGrid },
    ],
    marketplace: [
      { id: "navigation", name: "Navigation Menu", icon: MenuSquare },
      { id: "marketplace_hero", name: "Hero Carousel", icon: ImageIcon },
      { id: "marketplace_flash_sales", name: "Flash Sales", icon: LayoutGrid },
      { id: "marketplace_official_stores", name: "Official Stores", icon: LayoutGrid },
      { id: "marketplace_just_for_you", name: "Just For You", icon: LayoutGrid },
    ]
  };

  const sections = allSections[activeTheme as keyof typeof allSections] || allSections.aliexpress;

  const renderLayoutControls = (sectionPrefix: string) => (
    <div className="bg-white p-4 rounded-lg border border-[#c9cccf] space-y-4 mb-6 shadow-sm">
      <h3 className="font-bold text-sm text-black border-b border-[#e1e3e5] pb-2">Advanced Layout</h3>
      <div className="space-y-4 pt-1">
        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Background Color</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={settings[`${sectionPrefix}_bg`] || "#ffffff"}
              onChange={(e) => handleSettingChange(`${sectionPrefix}_bg`, e.target.value)}
              className="h-8 w-8 rounded cursor-pointer border border-[#c9cccf] p-0 overflow-hidden"
            />
            <input 
              type="text" 
              value={settings[`${sectionPrefix}_bg`] || ""}
              onChange={(e) => handleSettingChange(`${sectionPrefix}_bg`, e.target.value)}
              className="flex-1 p-1.5 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm font-mono placeholder:text-gray-400"
              placeholder="e.g. transparent"
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-semibold text-gray-700">Top Padding (px)</label>
            <span className="text-xs text-gray-500 font-mono">{settings[`${sectionPrefix}_pt`] || "48"}</span>
          </div>
          <input 
            type="range" min="0" max="120" step="4" 
            value={settings[`${sectionPrefix}_pt`] || "48"} 
            onChange={(e) => handleSettingChange(`${sectionPrefix}_pt`, e.target.value)} 
            className="w-full accent-black"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-semibold text-gray-700">Bottom Padding (px)</label>
            <span className="text-xs text-gray-500 font-mono">{settings[`${sectionPrefix}_pb`] || "48"}</span>
          </div>
          <input 
            type="range" min="0" max="120" step="4" 
            value={settings[`${sectionPrefix}_pb`] || "48"} 
            onChange={(e) => handleSettingChange(`${sectionPrefix}_pb`, e.target.value)} 
            className="w-full accent-black"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1 text-gray-700">Container Width</label>
          <select 
            value={settings[`${sectionPrefix}_width`] || "container"}
            onChange={(e) => handleSettingChange(`${sectionPrefix}_width`, e.target.value)}
            className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm bg-white"
          >
            <option value="container">Standard (Max 1500px)</option>
            <option value="full">Full Width (100%)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#f6f6f7] flex flex-col overflow-hidden text-[#202223]">
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-[#c9cccf] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-[#f6f6f7] rounded-md transition-colors text-[#5c5f62]">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Theme Selection</span>
            <select 
              value={activeTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="text-xs bg-transparent border-none outline-none font-bold text-[#00602a] cursor-pointer hover:underline"
            >
              <option value="aliexpress">AliExpress Pro Theme (Live)</option>
              <option value="elegant">Elegant Minimal Theme</option>
              <option value="marketplace">Marketplace Theme</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#f6f6f7] p-1 rounded-md border border-[#c9cccf]">
          <button 
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded ${device === "desktop" ? "bg-white shadow-sm text-black" : "text-[#5c5f62] hover:bg-[#e1e3e5]"}`}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded ${device === "mobile" ? "bg-white shadow-sm text-black" : "text-[#5c5f62] hover:bg-[#e1e3e5]"}`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 relative">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
          
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#5c5f62] hover:bg-[#f6f6f7] p-2 rounded-md"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute top-full right-[100px] mt-1 w-48 bg-white border border-[#c9cccf] rounded-lg shadow-lg py-1 z-50">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-4 py-2 text-sm text-[#202223] hover:bg-[#f6f6f7] flex items-center gap-2"
              >
                <Upload className="h-4 w-4" /> Import Theme config
              </button>
              <button 
                onClick={handleExport}
                className="w-full text-left px-4 py-2 text-sm text-[#202223] hover:bg-[#f6f6f7] flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export Theme config
              </button>
            </div>
          )}
          <button className="text-[#5c5f62] hover:bg-[#f6f6f7] p-2 rounded-md">
            <Eye className="h-5 w-5" />
          </button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#008060] hover:bg-[#006e52] text-white shadow-[0_1px_0_rgba(0,0,0,0.15)] h-8 px-4 text-sm font-semibold"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Editor */}
        <div className="w-[320px] bg-white border-r border-[#c9cccf] flex flex-col shrink-0 overflow-y-auto">
          <div className="flex border-b border-[#c9cccf] shrink-0">
            <button 
              onClick={() => setActiveTab("sections")}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "sections" ? "border-black text-black" : "border-transparent text-[#5c5f62] hover:bg-[#f6f6f7]"}`}
            >Sections</button>
            <button 
              onClick={() => setActiveTab("theme_settings")}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "theme_settings" ? "border-black text-black" : "border-transparent text-[#5c5f62] hover:bg-[#f6f6f7]"}`}
            >Theme settings</button>
            <button 
              onClick={() => setActiveTab("app_embeds")}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 ${activeTab === "app_embeds" ? "border-black text-black" : "border-transparent text-[#5c5f62] hover:bg-[#f6f6f7]"}`}
            >App embeds</button>
          </div>
          {activeTab === "sections" ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <ThemeBlockEditorClient 
                  key={activeTheme}
                  initialConfigStr={settings[`storefront_theme_config_${activeTheme}`]}
                  onConfigChange={(val) => handleSettingChange(`storefront_theme_config_${activeTheme}`, val)}
                  categories={categories}
                  themeSchema={
                    activeTheme === "elegant" ? ElegantThemeSchema :
                    activeTheme === "marketplace" ? MarketplaceThemeSchema :
                    AliExpressThemeSchema
                  }
                  defaultConfig={
                    activeTheme === "elegant" ? defaultElegantConfig :
                    activeTheme === "marketplace" ? defaultMarketplaceConfig :
                    defaultAliExpressConfig
                  }
                />
              </div>
            </div>
          ) : (
            <div>
              
              {activeTab === "theme_settings" && (
                <div className="animate-in fade-in duration-200">
                  <div className="p-4 space-y-6">
                    <h2 className="font-semibold text-lg text-black mb-4">Theme Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-800">Logo URL</label>
                        <UrlInputWithUpload 
                          value={settings["storefront_logo_url"] || ""}
                          onChange={(val) => handleSettingChange("storefront_logo_url", val)}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-800">Primary Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={settings["storefront_primary_color"] || "#0071FF"}
                            onChange={(e) => handleSettingChange("storefront_primary_color", e.target.value)}
                            className="h-8 w-8 rounded cursor-pointer border border-[#c9cccf] p-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "app_embeds" && (
                <div className="animate-in fade-in duration-200 p-4">
                  <p className="text-sm text-[#5c5f62]">No app embeds available.</p>
                </div>
              )}
            </div>
          )}
        </div>

{/* Right Side - Iframe Preview */}
        <div className="flex-1 bg-[#e1e3e5] p-4 flex justify-center items-start overflow-hidden">
          <div className={`bg-white shadow-xl rounded-b-md overflow-hidden transition-all duration-300 ${
            device === "desktop" ? "w-full h-full" : "w-[375px] h-[812px] rounded-t-xl border-[8px] border-[#202223]"
          }`}>
            <iframe 
              ref={iframeRef}
              src="/" 
              className="w-full h-full border-0 pointer-events-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
