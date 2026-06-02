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
import { useRouter } from "next/navigation";

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
          {activeSection ? (
            <div className="animate-in slide-in-from-right-4 duration-200">
              <div className="flex items-center gap-3 p-4 border-b border-[#c9cccf] sticky top-0 bg-white z-10">
                <button onClick={() => setActiveSection(null)} className="p-1 hover:bg-[#f6f6f7] rounded">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="font-semibold">{sections.find(s => s.id === activeSection)?.name}</h2>
              </div>
              
              <div className="p-4 space-y-6">
                {activeSection === "navigation" && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Menu Links (JSON array)</label>
                    <p className="text-xs text-muted-foreground mb-2">Example: <br/><code>[{"{"}"name": "Bundle deals", "url": "/deals", "highlight": true{"}"}]</code></p>
                    <textarea 
                      value={settings["storefront_main_menu"] || ""}
                      onChange={(e) => handleSettingChange("storefront_main_menu", e.target.value)}
                      className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm h-64 font-mono whitespace-pre"
                      placeholder={'[\n  {\n    "name": "Bundle deals",\n    "url": "/deals",\n    "highlight": true\n  }\n]'}
                    />
                  </div>
                )}

                {activeSection === "announcement" && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Text</label>
                    <input 
                      type="text" 
                      value={settings["storefront_announcement_text"] || ""}
                      onChange={(e) => handleSettingChange("storefront_announcement_text", e.target.value)}
                      className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                    />
                  </div>
                )}
                
                {activeSection === "hero" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Background Color</label>
                      <input 
                        type="color" 
                        value={settings["storefront_hero_bg_color"] || "#0071FF"}
                        onChange={(e) => handleSettingChange("storefront_hero_bg_color", e.target.value)}
                        className="w-full h-10 p-1 border border-[#c9cccf] rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Sale Ends Countdown Text</label>
                      <input 
                        type="text" 
                        value={settings["storefront_hero_countdown"] || "Jun 11, 11:59 (GMT+5)"}
                        onChange={(e) => handleSettingChange("storefront_hero_countdown", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        placeholder="Jun 11, 11:59 (GMT+5)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Discount Title</label>
                      <input 
                        type="text" 
                        value={settings["storefront_hero_discount"] || "UP TO 80% OFF"}
                        onChange={(e) => handleSettingChange("storefront_hero_discount", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        placeholder="UP TO 80% OFF"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Side Graphic Image URL</label>
                      <input 
                        type="url" 
                        value={settings["storefront_hero_side_image"] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500"}
                        onChange={(e) => handleSettingChange("storefront_hero_side_image", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        placeholder="Image URL"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-bold text-sm mb-2">Coupon 1</h3>
                      <input type="text" placeholder="Title (e.g. US $65 OFF)" value={settings["storefront_coupon_1_title"] || ""} onChange={(e) => handleSettingChange("storefront_coupon_1_title", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm mb-2" />
                      <input type="text" placeholder="Requirement (e.g. orders US $469+)" value={settings["storefront_coupon_1_req"] || ""} onChange={(e) => handleSettingChange("storefront_coupon_1_req", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm mb-2" />
                      <input type="text" placeholder="Code (e.g. Code:AESS07)" value={settings["storefront_coupon_1_code"] || ""} onChange={(e) => handleSettingChange("storefront_coupon_1_code", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm" />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-bold text-sm mb-2">Coupon 2</h3>
                      <input type="text" placeholder="Title" value={settings["storefront_coupon_2_title"] || ""} onChange={(e) => handleSettingChange("storefront_coupon_2_title", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm mb-2" />
                      <input type="text" placeholder="Requirement" value={settings["storefront_coupon_2_req"] || ""} onChange={(e) => handleSettingChange("storefront_coupon_2_req", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm mb-2" />
                      <input type="text" placeholder="Code" value={settings["storefront_coupon_2_code"] || ""} onChange={(e) => handleSettingChange("storefront_coupon_2_code", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm" />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-bold text-sm mb-2">Coupon 3</h3>
                      <input type="text" placeholder="Title" value={settings["storefront_coupon_3_title"] || ""} onChange={(e) => handleSettingChange("storefront_coupon_3_title", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm mb-2" />
                      <input type="text" placeholder="Requirement" value={settings["storefront_coupon_3_req"] || ""} onChange={(e) => handleSettingChange("storefront_coupon_3_req", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm mb-2" />
                      <input type="text" placeholder="Code" value={settings["storefront_coupon_3_code"] || ""} onChange={(e) => handleSettingChange("storefront_coupon_3_code", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm" />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-bold text-sm mb-2">Top Deal Box</h3>
                      <input type="text" placeholder="Image URL" value={settings["storefront_topdeal_image"] || ""} onChange={(e) => handleSettingChange("storefront_topdeal_image", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm mb-2" />
                      <input type="text" placeholder="Price Overlay (e.g. US $2.05)" value={settings["storefront_topdeal_price"] || ""} onChange={(e) => handleSettingChange("storefront_topdeal_price", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm" />
                    </div>
                  </div>
                )}

                {activeSection === "deals" && (
                  <div className="space-y-6">
                    {renderLayoutControls("storefront_deals")}
                    <div>
                      <h3 className="font-bold text-sm mb-2 text-[#008060]">Bestsellers Block</h3>
                      <div className="space-y-3 pl-3 border-l-2 border-[#e1e3e5]">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Title</label>
                          <input type="text" value={settings["storefront_bestsellers_title"] || "Bestsellers"} onChange={(e) => handleSettingChange("storefront_bestsellers_title", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Subtitle</label>
                          <input type="text" value={settings["storefront_bestsellers_subtitle"] || "Top price & quality picks >"} onChange={(e) => handleSettingChange("storefront_bestsellers_subtitle", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Category Source</label>
                          <select 
                            value={settings["storefront_bestsellers_category_id"] || ""}
                            onChange={(e) => handleSettingChange("storefront_bestsellers_category_id", e.target.value)}
                            className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                          >
                            <option value="">-- Select Category --</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm mb-2 text-[#008060]">SuperDeals Block</h3>
                      <div className="space-y-3 pl-3 border-l-2 border-[#e1e3e5]">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Title</label>
                          <input type="text" value={settings["storefront_superdeals_title"] || "SuperDeals"} onChange={(e) => handleSettingChange("storefront_superdeals_title", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Subtitle</label>
                          <input type="text" value={settings["storefront_superdeals_subtitle"] || "Up to 80% off >"} onChange={(e) => handleSettingChange("storefront_superdeals_subtitle", e.target.value)} className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Category Source</label>
                          <select 
                            value={settings["storefront_superdeals_category_id"] || ""}
                            onChange={(e) => handleSettingChange("storefront_superdeals_category_id", e.target.value)}
                            className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                          >
                            <option value="">-- Select Category --</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "new_arrivals" && (
                  <div className="space-y-6">
                    {renderLayoutControls("storefront_new_arrivals")}
                    <div>
                    <label className="block text-xs font-semibold mb-1">Title</label>
                    <input 
                      type="text" 
                      value={settings["storefront_new_arrivals_title"] || "New Arrivals"}
                      onChange={(e) => handleSettingChange("storefront_new_arrivals_title", e.target.value)}
                      className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                    />
                    </div>
                  </div>
                )}

                {activeSection === "more_to_love" && (
                  <div className="space-y-6">
                    {renderLayoutControls("storefront_more_to_love")}
                    <div>
                      <label className="block text-xs font-semibold mb-1">Title</label>
                      <input 
                        type="text" 
                        value={settings["storefront_more_to_love_title"] || "More to love"}
                        onChange={(e) => handleSettingChange("storefront_more_to_love_title", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}

                {activeSection === "features" && (
                  <>
                    <h3 className="font-semibold text-sm">Block 1</h3>
                    <div className="pl-2 border-l-2 border-[#e1e3e5] space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Heading</label>
                        <input 
                          type="text" 
                          value={settings["storefront_feature_1_title"] || ""}
                          onChange={(e) => handleSettingChange("storefront_feature_1_title", e.target.value)}
                          className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Text</label>
                        <input 
                          type="text" 
                          value={settings["storefront_feature_1_desc"] || ""}
                          onChange={(e) => handleSettingChange("storefront_feature_1_desc", e.target.value)}
                          className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeSection === "elegant_categories" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Section Title</label>
                      <input 
                        type="text" 
                        value={settings["storefront_elegant_categories_title"] || "TOP CATEGORY"}
                        onChange={(e) => handleSettingChange("storefront_elegant_categories_title", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Subtitle</label>
                      <input 
                        type="text" 
                        value={settings["storefront_elegant_categories_subtitle"] || "Most Viewed Categories with Affordable Prices"}
                        onChange={(e) => handleSettingChange("storefront_elegant_categories_subtitle", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                    <div className="border-t border-[#e1e3e5] pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold">Choose Categories to Display</label>
                        <button
                          onClick={() => handleSettingChange("storefront_elegant_category_ids", "[]")}
                          className="text-xs text-[#5c5f62] hover:text-red-600 underline"
                        >
                          Clear all
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">Leave all unchecked to show all categories.</p>
                      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                        {categories.length === 0 && (
                          <p className="text-xs text-gray-400 italic">No categories found. Add some in Admin → Categories.</p>
                        )}
                        {categories.map(cat => {
                          let selectedIds: string[] = [];
                          try { selectedIds = JSON.parse(settings["storefront_elegant_category_ids"] || "[]"); } catch {}
                          const isChecked = selectedIds.includes(cat.id);
                          return (
                            <label key={cat.id} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isChecked ? "bg-[#f0f7f4]" : "hover:bg-[#f6f6f7]"}`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  let ids: string[] = [];
                                  try { ids = JSON.parse(settings["storefront_elegant_category_ids"] || "[]"); } catch {}
                                  if (isChecked) {
                                    ids = ids.filter(id => id !== cat.id);
                                  } else {
                                    ids = [...ids, cat.id];
                                  }
                                  handleSettingChange("storefront_elegant_category_ids", JSON.stringify(ids));
                                }}
                                className="accent-[#008060] w-4 h-4 shrink-0"
                              />
                              <span className="text-sm font-medium text-[#202223] truncate">{cat.name}</span>
                              {isChecked && <span className="ml-auto text-[10px] font-bold text-[#008060] shrink-0">✓ Selected</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "elegant_hero" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Banner Title</label>
                      <input 
                        type="text" 
                        value={settings["storefront_elegant_hero_title"] || "LAMPS BY YZ"}
                        onChange={(e) => handleSettingChange("storefront_elegant_hero_title", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Banner Image URL</label>
                      <input 
                        type="url" 
                        value={settings["storefront_elegant_hero_image"] || "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1500"}
                        onChange={(e) => handleSettingChange("storefront_elegant_hero_image", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}

                {activeSection === "elegant_best_sellers" && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Section Title</label>
                    <input 
                      type="text" 
                      value={settings["storefront_elegant_bestsellers_title"] || "BEST SELLERS"}
                      onChange={(e) => handleSettingChange("storefront_elegant_bestsellers_title", e.target.value)}
                      className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                    />
                  </div>
                )}

                {activeSection === "elegant_featured_plants" && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Section Title</label>
                    <input 
                      type="text" 
                      value={settings["storefront_elegant_featured_title"] || "FEATURED PLANTS"}
                      onChange={(e) => handleSettingChange("storefront_elegant_featured_title", e.target.value)}
                      className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                    />
                  </div>
                )}

                {activeSection === "elegant_new_arrivals" && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Section Title</label>
                    <input 
                      type="text" 
                      value={settings["storefront_elegant_new_arrivals_title"] || "NEW ARRIVALS"}
                      onChange={(e) => handleSettingChange("storefront_elegant_new_arrivals_title", e.target.value)}
                      className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                    />
                  </div>
                )}

                {activeSection === "marketplace_hero" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Hero Image URL</label>
                      <input 
                        type="url" 
                        value={settings["storefront_marketplace_hero_image"] || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000"}
                        onChange={(e) => handleSettingChange("storefront_marketplace_hero_image", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {activeSection === "marketplace_flash_sales" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Section Title</label>
                      <input 
                        type="text" 
                        value={settings["storefront_marketplace_flash_title"] || "Flash Sales"}
                        onChange={(e) => handleSettingChange("storefront_marketplace_flash_title", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {activeSection === "marketplace_official_stores" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Section Title</label>
                      <input 
                        type="text" 
                        value={settings["storefront_marketplace_stores_title"] || "Official Stores"}
                        onChange={(e) => handleSettingChange("storefront_marketplace_stores_title", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {activeSection === "marketplace_just_for_you" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Section Title</label>
                      <input 
                        type="text" 
                        value={settings["storefront_marketplace_foryou_title"] || "Just For You"}
                        onChange={(e) => handleSettingChange("storefront_marketplace_foryou_title", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex border-b border-[#c9cccf]">
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
              
              {activeTab === "sections" && (
                <div className="animate-in fade-in duration-200">
                  <div className="p-2 space-y-1 mt-2">
                    <div className="px-3 py-1.5 text-xs font-bold text-[#5c5f62] uppercase tracking-wider">Template</div>
                    
                    {sections.map((section) => {
                      const isHidden = settings[`storefront_show_${section.id}`] === "false";
                      if (isHidden) return null;

                      return (
                        <div key={section.id} className="w-full flex items-center justify-between p-2 hover:bg-[#f6f6f7] rounded-md group">
                          <button 
                            onClick={() => setActiveSection(section.id)}
                            className="flex-1 flex items-center gap-3 text-left"
                          >
                            <GripVertical className="h-4 w-4 text-[#8c9196] opacity-0 group-hover:opacity-100 cursor-grab" />
                            <section.icon className="h-5 w-5 text-[#5c5f62]" />
                            <span className="text-sm font-medium">{section.name}</span>
                          </button>
                          <button 
                            onClick={() => handleSettingChange(`storefront_show_${section.id}`, "false")}
                            className="p-1.5 text-[#8c9196] hover:bg-[#e1e3e5] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hide section"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 border-t border-[#c9cccf] mt-4 relative">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveSection("add_section_menu")}
                      className="w-full border-dashed border-[#8c9196] text-[#5c5f62]"
                    >
                      + Add section
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "theme_settings" && (
                <div className="p-4 space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-bold text-sm mb-4">Logo</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Logo URL (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/logo.png"
                          value={settings["storefront_logo_url"] || ""}
                          onChange={(e) => handleSettingChange("storefront_logo_url", e.target.value)}
                          className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">If empty, a text logo will be used.</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Text Logo Name</label>
                        <input 
                          type="text" 
                          placeholder="Aura"
                          value={settings["storefront_logo_text"] || ""}
                          onChange={(e) => handleSettingChange("storefront_logo_text", e.target.value)}
                          className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Logo Height (px)</label>
                          <input 
                            type="number" 
                            value={settings["storefront_logo_height"] || "40"}
                            onChange={(e) => handleSettingChange("storefront_logo_height", e.target.value)}
                            className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Accent Color</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={settings["storefront_logo_accent"] || "#f97316"}
                              onChange={(e) => handleSettingChange("storefront_logo_accent", e.target.value)}
                              className="h-9 w-9 rounded cursor-pointer border border-[#c9cccf] p-0"
                            />
                            <input 
                              type="text" 
                              value={settings["storefront_logo_accent"] || "#f97316"}
                              onChange={(e) => handleSettingChange("storefront_logo_accent", e.target.value)}
                              className="flex-1 p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="border-[#c9cccf]" />
                  <div>
                    <h3 className="font-bold text-sm mb-4">Colors</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Primary Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={settings["storefront_primary_color"] || "#000000"}
                            onChange={(e) => handleSettingChange("storefront_primary_color", e.target.value)}
                            className="h-8 w-8 rounded cursor-pointer border border-[#c9cccf]"
                          />
                          <input 
                            type="text" 
                            value={settings["storefront_primary_color"] || "#000000"}
                            onChange={(e) => handleSettingChange("storefront_primary_color", e.target.value)}
                            className="flex-1 p-1.5 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Background Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={settings["storefront_bg_color"] || "#ffffff"}
                            onChange={(e) => handleSettingChange("storefront_bg_color", e.target.value)}
                            className="h-8 w-8 rounded cursor-pointer border border-[#c9cccf]"
                          />
                          <input 
                            type="text" 
                            value={settings["storefront_bg_color"] || "#ffffff"}
                            onChange={(e) => handleSettingChange("storefront_bg_color", e.target.value)}
                            className="flex-1 p-1.5 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Text Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={settings["storefront_text_color"] || "#111111"}
                            onChange={(e) => handleSettingChange("storefront_text_color", e.target.value)}
                            className="h-8 w-8 rounded cursor-pointer border border-[#c9cccf]"
                          />
                          <input 
                            type="text" 
                            value={settings["storefront_text_color"] || "#111111"}
                            onChange={(e) => handleSettingChange("storefront_text_color", e.target.value)}
                            className="flex-1 p-1.5 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#c9cccf] pt-6">
                    <h3 className="font-bold text-sm mb-4">Typography</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Font Family</label>
                        <select 
                          value={settings["storefront_font_family"] || "sans"}
                          onChange={(e) => handleSettingChange("storefront_font_family", e.target.value)}
                          className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        >
                          <option value="sans">System Sans-serif (Inter/Roboto)</option>
                          <option value="serif">System Serif (Playfair/Merriweather)</option>
                          <option value="mono">System Monospace</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#c9cccf] pt-6">
                    <h3 className="font-bold text-sm mb-4">Layout</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Border Radius</label>
                        <select 
                          value={settings["storefront_border_radius"] || "0.375rem"}
                          onChange={(e) => handleSettingChange("storefront_border_radius", e.target.value)}
                          className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        >
                          <option value="0px">None (Sharp corners)</option>
                          <option value="0.25rem">Small (4px)</option>
                          <option value="0.375rem">Medium (6px)</option>
                          <option value="0.5rem">Large (8px)</option>
                          <option value="1rem">Extra Large (16px)</option>
                          <option value="9999px">Full (Pill/Circle)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "app_embeds" && (
                <div className="p-4 space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-bold text-sm mb-4">Custom CSS</h3>
                    <p className="text-xs text-gray-500 mb-2">Write custom CSS to override theme styles globally.</p>
                    <textarea 
                      value={settings["storefront_custom_css"] || ""}
                      onChange={(e) => handleSettingChange("storefront_custom_css", e.target.value)}
                      className="w-full h-48 p-3 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm font-mono bg-[#1e1e1e] text-[#d4d4d4]"
                      placeholder="/* Add CSS here */&#10;body {&#10;  /* Example */&#10;}"
                    />
                  </div>
                  <div className="border-t border-[#c9cccf] pt-6">
                    <h3 className="font-bold text-sm mb-4">Analytics & Scripts</h3>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Google Analytics ID</label>
                      <input 
                        type="text" 
                        value={settings["storefront_ga_id"] || ""}
                        onChange={(e) => handleSettingChange("storefront_ga_id", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Add Section Menu Overlay */}
          {activeSection === "add_section_menu" && (
            <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center gap-3 p-4 border-b border-[#c9cccf]">
                <button onClick={() => setActiveSection(null)} className="p-1 hover:bg-[#f6f6f7] rounded">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="font-semibold">Add section</h2>
              </div>
              <div className="p-2 space-y-1 overflow-y-auto flex-1">
                {sections.filter(s => settings[`storefront_show_${s.id}`] === "false").length === 0 && (
                  <div className="p-4 text-center text-sm text-[#5c5f62]">All available sections are already added.</div>
                )}
                {sections.filter(s => settings[`storefront_show_${s.id}`] === "false").map(section => (
                  <button 
                    key={section.id}
                    onClick={() => {
                      handleSettingChange(`storefront_show_${section.id}`, "true");
                      setActiveSection(null);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#f6f6f7] rounded-md text-left"
                  >
                    <section.icon className="h-5 w-5 text-[#5c5f62]" />
                    <span className="text-sm font-medium">{section.name}</span>
                  </button>
                ))}
              </div>
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
