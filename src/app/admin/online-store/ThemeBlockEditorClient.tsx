"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, GripVertical, Eye, EyeOff, Trash2, LayoutGrid, Type, ImageIcon, ArrowUp, ArrowDown } from "lucide-react";
import { ThemeConfig, BlockSchemas, SectionSchema } from "@/lib/themeSchemas";
import { useRef } from "react";

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

export function ThemeBlockEditorClient({ 
  initialConfigStr, 
  onConfigChange,
  categories,
  themeSchema,
  defaultConfig
}: { 
  initialConfigStr: string | undefined, 
  onConfigChange: (configStr: string) => void,
  categories: any[],
  themeSchema: SectionSchema[],
  defaultConfig: ThemeConfig
}) {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [addingBlockTo, setAddingBlockTo] = useState<string | null>(null);

  useEffect(() => {
    if (initialConfigStr) {
      try {
        const parsed = JSON.parse(initialConfigStr);
        // Ensure blocks exist for backwards compatibility
        Object.keys(parsed.sections).forEach(key => {
          if (!parsed.sections[key].block_order) parsed.sections[key].block_order = [];
          if (!parsed.sections[key].blocks) parsed.sections[key].blocks = {};
        });
        setConfig(parsed);
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
  }, [initialConfigStr]);

  const saveConfig = (newConfig: ThemeConfig) => {
    setConfig(newConfig);
    onConfigChange(JSON.stringify(newConfig));
  };

  const updateSectionSetting = (sectionId: string, key: string, value: any) => {
    const newConfig = { ...config };
    newConfig.sections = { ...newConfig.sections };
    newConfig.sections[sectionId] = {
      ...newConfig.sections[sectionId],
      settings: {
        ...newConfig.sections[sectionId].settings,
        [key]: value
      }
    };
    saveConfig(newConfig);
  };

  const updateBlockSetting = (sectionId: string, blockId: string, key: string, value: any) => {
    const newConfig = { ...config };
    newConfig.sections = { ...newConfig.sections };
    newConfig.sections[sectionId] = {
      ...newConfig.sections[sectionId],
      blocks: {
        ...newConfig.sections[sectionId].blocks,
        [blockId]: {
          ...newConfig.sections[sectionId].blocks![blockId],
          settings: {
            ...newConfig.sections[sectionId].blocks![blockId].settings,
            [key]: value
          }
        }
      }
    };
    saveConfig(newConfig);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const isHidden = config.sections[sectionId].settings["hidden"];
    updateSectionSetting(sectionId, "hidden", !isHidden);
  };

  const removeSection = (sectionId: string) => {
    const newConfig = { ...config };
    newConfig.order = newConfig.order.filter(id => id !== sectionId);
    delete newConfig.sections[sectionId];
    saveConfig(newConfig);
    if (activeSectionId === sectionId) {
      setActiveSectionId(null);
      setActiveBlockId(null);
    }
  };

  const removeBlock = (sectionId: string, blockId: string) => {
    const newConfig = { ...config };
    newConfig.sections = { ...newConfig.sections };
    newConfig.sections[sectionId] = { ...newConfig.sections[sectionId] };
    newConfig.sections[sectionId].block_order = newConfig.sections[sectionId].block_order!.filter(id => id !== blockId);
    newConfig.sections[sectionId].blocks = { ...newConfig.sections[sectionId].blocks! };
    delete newConfig.sections[sectionId].blocks![blockId];
    saveConfig(newConfig);
    if (activeBlockId === blockId) setActiveBlockId(null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newConfig = { ...config };
      const temp = newConfig.order[index - 1];
      newConfig.order[index - 1] = newConfig.order[index];
      newConfig.order[index] = temp;
      saveConfig(newConfig);
    } else if (direction === 'down' && index < config.order.length - 1) {
      const newConfig = { ...config };
      const temp = newConfig.order[index + 1];
      newConfig.order[index + 1] = newConfig.order[index];
      newConfig.order[index] = temp;
      saveConfig(newConfig);
    }
  };

  const moveBlock = (sectionId: string, index: number, direction: 'up' | 'down') => {
    const section = config.sections[sectionId];
    const order = section.block_order || [];
    
    if (direction === 'up' && index > 0) {
      const newConfig = { ...config };
      const newOrder = [...order];
      const temp = newOrder[index - 1];
      newOrder[index - 1] = newOrder[index];
      newOrder[index] = temp;
      newConfig.sections[sectionId].block_order = newOrder;
      saveConfig(newConfig);
    } else if (direction === 'down' && index < order.length - 1) {
      const newConfig = { ...config };
      const newOrder = [...order];
      const temp = newOrder[index + 1];
      newOrder[index + 1] = newOrder[index];
      newOrder[index] = temp;
      newConfig.sections[sectionId].block_order = newOrder;
      saveConfig(newConfig);
    }
  };

  const addSection = (type: string) => {
    const newId = `${type}_${Date.now()}`;
    const newConfig = { ...config };
    newConfig.order.push(newId);
    newConfig.sections[newId] = { type, settings: {}, block_order: [], blocks: {} };
    saveConfig(newConfig);
    setAddingSection(false);
    setActiveSectionId(newId);
    setActiveBlockId(null);
  };

  const addBlock = (sectionId: string, type: string) => {
    const newId = `block_${type}_${Date.now()}`;
    const newConfig = { ...config };
    newConfig.sections = { ...newConfig.sections };
    newConfig.sections[sectionId] = { ...newConfig.sections[sectionId] };
    
    if (!newConfig.sections[sectionId].block_order) newConfig.sections[sectionId].block_order = [];
    else newConfig.sections[sectionId].block_order = [...newConfig.sections[sectionId].block_order!];
    
    if (!newConfig.sections[sectionId].blocks) newConfig.sections[sectionId].blocks = {};
    else newConfig.sections[sectionId].blocks = { ...newConfig.sections[sectionId].blocks! };
    
    newConfig.sections[sectionId].block_order!.push(newId);
    newConfig.sections[sectionId].blocks![newId] = { type, settings: {} };
    saveConfig(newConfig);
    setAddingBlockTo(null);
    setActiveBlockId(newId);
  };

  const renderIcon = (iconName: string) => {
    if (iconName === "ImageIcon") return <ImageIcon className="h-4 w-4 text-[#5c5f62]" />;
    if (iconName === "LayoutGrid") return <LayoutGrid className="h-4 w-4 text-[#5c5f62]" />;
    if (iconName === "Type") return <Type className="h-4 w-4 text-[#5c5f62]" />;
    return <LayoutGrid className="h-4 w-4 text-[#5c5f62]" />;
  };

  const renderField = (field: any, value: any, onChange: (val: any) => void) => {
    return (
      <div key={field.id} className="mb-4">
        <label className="block text-xs font-semibold mb-1 text-gray-700">{field.label}</label>
        
        {field.type === "url" ? (
          <UrlInputWithUpload 
            value={value !== undefined ? value : (field.default || "")}
            onChange={onChange}
            placeholder={field.placeholder || field.default || "https://..."}
          />
        ) : field.type === "text" ? (
          <input 
            type="text" 
            value={value !== undefined ? value : (field.default || "")}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
            placeholder={field.placeholder || field.default}
          />
        ) : field.type === "textarea" ? (
          <textarea 
            value={value !== undefined ? value : (field.default || "")}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm h-24"
            placeholder={field.placeholder || field.default}
          />
        ) : field.type === "color" ? (
          <div className="flex gap-2">
            <input 
              type="color" 
              value={value !== undefined ? value : (field.default || "#000000")}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 w-8 rounded cursor-pointer border border-[#c9cccf] p-0 overflow-hidden"
            />
            <input 
              type="text" 
              value={value !== undefined ? value : (field.default || "")}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 p-1.5 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm font-mono placeholder:text-gray-400"
            />
          </div>
        ) : field.type === "number" ? (
          <input 
            type="number" 
            value={value !== undefined ? value : (field.default || 0)}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
          />
        ) : field.type === "category" ? (
          <select 
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
          >
            <option value="">-- Select Category --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        ) : field.type === "boolean" ? (
          <input 
            type="checkbox"
            checked={value !== undefined ? value : (field.default || false)}
            onChange={(e) => onChange(e.target.checked)}
            className="accent-black h-4 w-4"
          />
        ) : field.type === "category_multi" ? (
          <div className="space-y-2 border border-[#c9cccf] p-2 rounded max-h-[200px] overflow-y-auto">
            {categories.map(c => {
              const checkedList = value ? (typeof value === "string" ? JSON.parse(value) : value) : [];
              const isChecked = checkedList.includes(c.id);
              return (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      let newList = [...checkedList];
                      if (e.target.checked) {
                        newList.push(c.id);
                      } else {
                        newList = newList.filter((id: string) => id !== c.id);
                      }
                      onChange(JSON.stringify(newList));
                    }}
                    className="accent-black h-4 w-4"
                  />
                  <span>{c.name}</span>
                </label>
              );
            })}
          </div>
        ) : null}
        {field.helpText && <p className="text-[10px] text-gray-500 mt-1">{field.helpText}</p>}
      </div>
    );
  };

  if (activeBlockId && activeSectionId) {
    const section = config.sections[activeSectionId];
    if (!section || !section.blocks) return null;
    const block = section.blocks[activeBlockId];
    if (!block) return null;
    const schema = BlockSchemas.find(s => s.type === block.type);
    if (!schema) return null;

    return (
      <div className="animate-in slide-in-from-right-4 duration-200 h-full flex flex-col bg-white">
        <div className="flex items-center gap-3 p-4 border-b border-[#c9cccf] sticky top-0 bg-white z-10 shrink-0">
          <button onClick={() => setActiveBlockId(null)} className="p-1 hover:bg-[#f6f6f7] rounded">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col flex-1 truncate">
            <span className="text-[10px] text-gray-500 font-bold uppercase">{schema.name}</span>
            <h2 className="font-semibold text-sm truncate">Block Settings</h2>
          </div>
          <button onClick={() => removeBlock(activeSectionId, activeBlockId)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete block">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 pb-20">
          {schema.fields.map(field => renderField(
            field, 
            block.settings[field.id], 
            (val) => updateBlockSetting(activeSectionId, activeBlockId, field.id, val)
          ))}
        </div>
      </div>
    );
  }

  if (addingBlockTo) {
    const targetSection = config.sections[addingBlockTo];
    const targetSchema = themeSchema.find(s => s.type === targetSection?.type);
    const availableBlocks = targetSchema?.allowedBlocks 
      ? BlockSchemas.filter(b => targetSchema.allowedBlocks!.includes(b.type))
      : BlockSchemas;

    return (
      <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-3 p-4 border-b border-[#c9cccf]">
          <button onClick={() => setAddingBlockTo(null)} className="p-1 hover:bg-[#f6f6f7] rounded">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold">Add block</h2>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {availableBlocks.map(schema => (
            <button 
              key={schema.type}
              onClick={() => addBlock(addingBlockTo, schema.type)}
              className="w-full flex items-center gap-3 p-3 hover:bg-[#f6f6f7] rounded-md text-left group"
            >
              {renderIcon(schema.icon)}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#202223]">{schema.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeSectionId) {
    const section = config.sections[activeSectionId];
    if (!section) return null;
    const schema = themeSchema.find(s => s.type === section.type);
    if (!schema) return null;
    const blocks = section.block_order || [];

    return (
      <div className="animate-in slide-in-from-right-4 duration-200 h-full flex flex-col bg-[#f6f6f7]">
        <div className="flex items-center gap-3 p-4 border-b border-[#c9cccf] sticky top-0 bg-white z-10 shrink-0">
          <button onClick={() => setActiveSectionId(null)} className="p-1 hover:bg-[#f6f6f7] rounded">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold flex-1 truncate">{schema.name}</h2>
          <button onClick={() => removeSection(activeSectionId)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete section">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 pb-20">
          <div className="bg-white p-4 mb-4 border-b border-[#c9cccf]">
            {schema.fields.map(field => renderField(
              field, 
              section.settings[field.id], 
              (val) => updateSectionSetting(activeSectionId, field.id, val)
            ))}
          </div>

          <div className="px-4 pb-4">
            <h3 className="text-xs font-bold text-[#5c5f62] uppercase tracking-wider mb-2">Blocks</h3>
            <div className="space-y-1">
              {blocks.map((blockId, index) => {
                const block = section.blocks?.[blockId];
                if (!block) return null;
                const blockSchema = BlockSchemas.find(s => s.type === block.type);
                let blockName = blockSchema?.name || block.type;
                if (block.type === "category_link") {
                  const customText = block.settings?.custom_text;
                  const catId = block.settings?.category_id;
                  if (customText) {
                    blockName = customText;
                  } else if (catId) {
                    const cat = categories.find(c => c.id === catId);
                    if (cat) blockName = cat.name;
                  }
                }

                return (
                  <div key={blockId} className="w-full flex items-center justify-between bg-white border border-[#c9cccf] p-2 hover:bg-[#f9fafb] rounded-md group">
                    <div 
                      onClick={() => setActiveBlockId(blockId)}
                      className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                    >
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 mr-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => moveBlock(activeSectionId, index, 'up')} disabled={index === 0} className="hover:text-black disabled:opacity-30">
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button onClick={() => moveBlock(activeSectionId, index, 'down')} disabled={index === blocks.length - 1} className="hover:text-black disabled:opacity-30">
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      {blockSchema ? renderIcon(blockSchema.icon) : <LayoutGrid className="h-4 w-4 text-[#5c5f62]" />}
                      <span className="text-sm font-medium">{blockName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => setAddingBlockTo(activeSectionId)}
              className="w-full mt-3 py-2 bg-white border border-dashed border-[#8c9196] text-[#5c5f62] rounded-md text-sm font-medium hover:bg-[#f6f6f7] transition-colors"
            >
              + Add block
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (addingSection) {
    return (
      <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-3 p-4 border-b border-[#c9cccf]">
          <button onClick={() => setAddingSection(false)} className="p-1 hover:bg-[#f6f6f7] rounded">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold">Add section</h2>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {themeSchema.map(schema => (
            <button 
              key={schema.type}
              onClick={() => addSection(schema.type)}
              className="w-full flex items-center gap-3 p-3 hover:bg-[#f6f6f7] rounded-md text-left group"
            >
              {renderIcon(schema.icon)}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#202223]">{schema.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-200 h-full flex flex-col">
      <div className="p-2 space-y-1 mt-2 flex-1 overflow-y-auto pb-20">
        <div className="px-3 py-1.5 text-xs font-bold text-[#5c5f62] uppercase tracking-wider">Template</div>
        
        {config.order.map((sectionId, index) => {
          const section = config.sections[sectionId];
          if (!section) return null;
          const schema = themeSchema.find(s => s.type === section.type);
          const isHidden = section.settings["hidden"] === true;
          
          return (
            <div key={sectionId} className={`w-full flex items-center justify-between p-2 hover:bg-[#f6f6f7] rounded-md group ${isHidden ? 'opacity-50' : ''}`}>
              <div 
                onClick={() => setActiveSectionId(sectionId)}
                className="flex-1 flex items-center gap-3 text-left cursor-pointer"
              >
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 mr-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="hover:text-black disabled:opacity-30">
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button onClick={() => moveSection(index, 'down')} disabled={index === config.order.length - 1} className="hover:text-black disabled:opacity-30">
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                {schema ? renderIcon(schema.icon) : <LayoutGrid className="h-5 w-5 text-[#5c5f62]" />}
                <span className={`text-sm font-medium ${isHidden ? 'line-through decoration-gray-400' : ''}`}>{schema?.name || section.type}</span>
              </div>
              <button 
                onClick={() => toggleSectionVisibility(sectionId)}
                className="p-1.5 text-[#8c9196] hover:bg-[#e1e3e5] rounded transition-opacity"
                title={isHidden ? "Show section" : "Hide section"}
              >
                {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100" />}
              </button>
            </div>
          );
        })}
        
        <div className="px-3 mt-4 pt-4 border-t border-[#c9cccf]">
          <button 
            onClick={() => setAddingSection(true)}
            className="w-full py-2 border border-dashed border-[#8c9196] text-[#5c5f62] rounded-md text-sm font-medium hover:bg-[#f6f6f7] transition-colors"
          >
            + Add section
          </button>
        </div>
      </div>
    </div>
  );
}
