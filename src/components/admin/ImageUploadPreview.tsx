"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadPreviewProps {
  defaultImageUrl?: string;
}

export function ImageUploadPreview({ defaultImageUrl }: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreviewUrl(null);
    // Note: To clear the actual file input, we would need a ref, 
    // but resetting preview works for basic UX. A hidden input can signal removal.
  };

  return (
    <div className="relative">
      <label htmlFor="image" className="block text-sm font-semibold mb-2 cursor-pointer">Product Image</label>
      
      {/* 
        CRITICAL: The file input must remain in the DOM without being destroyed/recreated. 
        If it's unmounted, the selected file is lost.
      */}
      <input 
        id="image" 
        name="image" 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className={previewUrl ? "hidden" : "absolute inset-0 w-full h-[200px] opacity-0 cursor-pointer z-10 top-8"} 
      />
      {!previewUrl && <input type="hidden" name="removeImage" value="true" />}

      {previewUrl ? (
        <div className="relative border rounded-xl overflow-hidden group aspect-square max-w-sm">
          <Image 
            src={previewUrl} 
            alt="Preview" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
            <button 
              onClick={handleRemove}
              className="bg-destructive text-white p-2 rounded-full hover:bg-destructive/90 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors relative h-[200px] flex flex-col items-center justify-center">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Click or drag image to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
        </div>
      )}
    </div>
  );
}
