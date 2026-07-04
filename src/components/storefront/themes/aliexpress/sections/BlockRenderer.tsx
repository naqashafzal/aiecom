import Link from "next/link";
import React from "react";

export function BlockRenderer({ block, storeCurrency = "USD" }: { block: { type: string; settings: Record<string, any> }, storeCurrency?: string }) {
  const { type, settings } = block;

  if (type === "text") {
    return (
      <div 
        style={{ 
          fontSize: settings.font_size ? `${settings.font_size}px` : undefined,
          color: settings.color || undefined,
          fontWeight: settings.font_weight || undefined
        }}
      >
        {settings.content}
      </div>
    );
  }

  if (type === "image") {
    return (
      <img 
        src={settings.url} 
        alt={settings.alt || ""} 
        style={{ 
          width: settings.width || "100%", 
          height: settings.height || "auto" 
        }} 
      />
    );
  }

  if (type === "button") {
    return (
      <Link 
        href={settings.url || "/"}
        style={{ 
          backgroundColor: settings.bg_color || "#0071FF",
          color: settings.text_color || "#FFFFFF"
        }}
        className="px-6 py-3 rounded-full font-bold inline-block hover:opacity-90 transition-opacity"
      >
        {settings.label || "Click Here"}
      </Link>
    );
  }

  if (type === "coupon") {
    return (
      <div className="bg-white rounded-md p-3 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
        {/* Dotted border effect on left/right for coupon look */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0071FF] -ml-1"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0071FF] -mr-1"></div>
        
        <span className="text-[#0071FF] font-black text-xl whitespace-nowrap">{settings.title}</span>
        <span className="text-[#888] text-[11px] font-medium mt-0.5 whitespace-nowrap">{settings.req}</span>
        <span className="text-[#0071FF] font-bold text-[12px] mt-2 whitespace-nowrap">{settings.code}</span>
      </div>
    );
  }

  if (type === "row") {
    return (
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${settings.columns || 2}, minmax(0, 1fr))`,
          gap: `${settings.gap || 16}px`
        }}
        className="w-full"
      >
        {/* Rows ideally contain blocks, but for now they just structure layout. 
            A full page builder would have recursive block rendering here. */}
        <div className="bg-gray-100 p-4 rounded text-center text-sm text-gray-500">Column 1</div>
        <div className="bg-gray-100 p-4 rounded text-center text-sm text-gray-500">Column 2</div>
      </div>
    );
  }

  return <div className="text-red-500 p-2 border border-red-500 rounded text-xs">Unknown block: {type}</div>;
}
