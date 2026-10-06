"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VariantAttribute {
  key: string;
  value: string;
}

interface VariantData {
  id?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  attributes: VariantAttribute[];
}

export function ProductVariantsManager({ defaultVariants = [] }: { defaultVariants?: any[] }) {
  const [variants, setVariants] = useState<VariantData[]>(() => {
    return defaultVariants.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price?.toString() || "",
      stock: v.stock?.toString() || "0",
      attributes: Object.entries(v.attributes || {}).map(([key, value]) => ({
        key,
        value: String(value)
      }))
    }));
  });

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: "",
        sku: `SKU-${Math.floor(Math.random() * 1000000)}`,
        price: "",
        stock: "0",
        attributes: []
      }
    ]);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof VariantData, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addAttribute = (variantIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].attributes.push({ key: "", value: "" });
    setVariants(newVariants);
  };

  const updateAttribute = (variantIndex: number, attrIndex: number, field: keyof VariantAttribute, value: string) => {
    const newVariants = [...variants];
    newVariants[variantIndex].attributes[attrIndex][field] = value;
    setVariants(newVariants);
  };

  const removeAttribute = (variantIndex: number, attrIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].attributes.splice(attrIndex, 1);
    setVariants(newVariants);
  };

  // Convert to the format expected by the server
  const getVariantsJson = () => {
    return JSON.stringify(
      variants.map(v => {
        const attrs: Record<string, string> = {};
        v.attributes.forEach(a => {
          if (a.key && a.value) attrs[a.key] = a.value;
        });
        return {
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock) || 0,
          attributes: attrs
        };
      })
    );
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="variantsData" value={getVariantsJson()} />
      
      {variants.map((variant, vIdx) => (
        <div key={vIdx} className="border rounded-xl p-4 bg-background shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">Variant {vIdx + 1}</h4>
            <Button variant="ghost" size="icon" type="button" onClick={() => removeVariant(vIdx)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Name (e.g. Small / Red)</label>
              <input type="text" required value={variant.name} onChange={(e) => updateVariant(vIdx, "name", e.target.value)} className="w-full h-9 px-3 rounded-md border text-sm bg-background" placeholder="Variant name" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">SKU</label>
              <input type="text" required value={variant.sku} onChange={(e) => updateVariant(vIdx, "sku", e.target.value)} className="w-full h-9 px-3 rounded-md border text-sm bg-background" placeholder="Unique SKU" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Price (Optional)</label>
              <input type="number" step="0.01" value={variant.price} onChange={(e) => updateVariant(vIdx, "price", e.target.value)} className="w-full h-9 px-3 rounded-md border text-sm bg-background" placeholder="Override price" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Stock</label>
              <input type="number" value={variant.stock} onChange={(e) => updateVariant(vIdx, "stock", e.target.value)} className="w-full h-9 px-3 rounded-md border text-sm bg-background" placeholder="Stock quantity" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold">Attributes (e.g. Size: M, Shape: Round)</label>
              <Button type="button" variant="outline" size="sm" onClick={() => addAttribute(vIdx)} className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add Attribute
              </Button>
            </div>
            {variant.attributes.map((attr, aIdx) => (
              <div key={aIdx} className="flex items-center gap-2">
                <input type="text" value={attr.key} onChange={(e) => updateAttribute(vIdx, aIdx, "key", e.target.value)} placeholder="Key (e.g. Shape)" className="w-1/3 h-8 px-2 rounded-md border text-xs bg-background" />
                <input type="text" value={attr.value} onChange={(e) => updateAttribute(vIdx, aIdx, "value", e.target.value)} placeholder="Value (e.g. Round)" className="flex-1 h-8 px-2 rounded-md border text-xs bg-background" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeAttribute(vIdx, aIdx)} className="h-8 w-8 text-destructive">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addVariant} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Variant
      </Button>
    </div>
  );
}

// Ensure X icon is imported
import { X } from "lucide-react";
