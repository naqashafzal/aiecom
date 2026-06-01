"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  Smartphone, 
  ChevronLeft, 
  MoreHorizontal, 
  Eye, 
  Save,
  GripVertical,
  Type,
  ImageIcon,
  LayoutGrid,
  Download,
  Upload
} from "lucide-react";
import Link from "next/link";
import { updateThemeSettings, importThemeSettings } from "./actions";
import { useRouter } from "next/navigation";

export default function LiveThemeEditor({ initialSettings }: { initialSettings: Record<string, string> }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("announcementText", settings["storefront_announcement_text"] || "");
    formData.append("heroTitle", settings["storefront_hero_title"] || "");
    formData.append("heroSubtitle", settings["storefront_hero_subtitle"] || "");
    formData.append("heroImage", settings["storefront_hero_image"] || "");
    formData.append("policy1Title", settings["storefront_policy_1_title"] || "");
    formData.append("policy2Title", settings["storefront_policy_2_title"] || "");
    formData.append("feature1Title", settings["storefront_feature_1_title"] || "");
    formData.append("feature1Desc", settings["storefront_feature_1_desc"] || "");
    
    formData.append("show_announcement", settings["storefront_show_announcement"] || "true");
    formData.append("show_hero", settings["storefront_show_hero"] || "true");
    formData.append("show_features", settings["storefront_show_features"] || "true");
    formData.append("show_products", settings["storefront_show_products"] || "true");
    formData.append("show_stores", settings["storefront_show_stores"] || "true");
    
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
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sections = [
    { id: "announcement", name: "Announcement bar", icon: Type },
    { id: "hero", name: "Image banner", icon: ImageIcon },
    { id: "features", name: "Value Props", icon: LayoutGrid },
    { id: "products", name: "Latest Products", icon: LayoutGrid },
    { id: "stores", name: "Premium Stores", icon: LayoutGrid },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#f6f6f7] flex flex-col overflow-hidden text-[#202223]">
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-[#c9cccf] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-[#f6f6f7] rounded-md transition-colors text-[#5c5f62]">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Dawn Theme <span className="bg-[#e4f8ec] text-[#00602a] text-[10px] px-1.5 py-0.5 rounded ml-2 uppercase font-bold">Live</span></span>
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
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Heading</label>
                      <input 
                        type="text" 
                        value={settings["storefront_hero_title"] || ""}
                        onChange={(e) => handleSettingChange("storefront_hero_title", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Description</label>
                      <textarea 
                        value={settings["storefront_hero_subtitle"] || ""}
                        onChange={(e) => handleSettingChange("storefront_hero_subtitle", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm h-24"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Background Image (URL)</label>
                      <input 
                        type="url" 
                        value={settings["storefront_hero_image"] || ""}
                        onChange={(e) => handleSettingChange("storefront_hero_image", e.target.value)}
                        className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                      />
                    </div>
                  </>
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
              </div>
            </div>
          ) : (
            <div>
              <div className="flex border-b border-[#c9cccf]">
                <button className="flex-1 py-3 text-sm font-semibold border-b-2 border-black text-black">Sections</button>
                <button className="flex-1 py-3 text-sm font-semibold text-[#5c5f62] hover:bg-[#f6f6f7]">Theme settings</button>
                <button className="flex-1 py-3 text-sm font-semibold text-[#5c5f62] hover:bg-[#f6f6f7]">App embeds</button>
              </div>
              
              <div className="p-2 space-y-1 mt-2">
                <div className="px-3 py-1.5 text-xs font-bold text-[#5c5f62] uppercase tracking-wider">Template</div>
                
                {sections.map((section) => {
                  const isHidden = settings[`storefront_show_${section.id}`] === "false";
                  if (isHidden) return null; // Don't show hidden sections in the main list

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
