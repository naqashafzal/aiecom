import React from "react";
import { BlockRenderer } from "./BlockRenderer";

export function CustomBuilderSection({ 
  settings, 
  block_order = [], 
  blocks = {},
  storeCurrency = "USD"
}: { 
  settings: Record<string, any>, 
  block_order?: string[], 
  blocks?: Record<string, any>,
  storeCurrency?: string
}) {
  return (
    <section 
      style={{
        paddingTop: settings["pt"] ? `${settings["pt"]}px` : '48px',
        paddingBottom: settings["pb"] ? `${settings["pb"]}px` : '48px',
        backgroundColor: settings["bg"] || "transparent",
      }}
      className="w-full relative"
    >
      <div className={`mx-auto px-4 lg:px-8 w-full ${settings["width"] === "full" ? "max-w-none" : "max-w-[1500px]"}`}>
        <div className="flex flex-col gap-4">
          {block_order.map(id => {
            const block = blocks[id];
            if (!block) return null;
            return <BlockRenderer key={id} block={block} storeCurrency={storeCurrency} />;
          })}
          {block_order.length === 0 && (
            <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded text-gray-500">
              Empty Section. Add blocks using the Live Theme Editor.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
