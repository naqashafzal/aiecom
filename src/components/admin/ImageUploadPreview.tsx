"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadPreviewProps {
  defaultImageUrls?: string[];
  label?: string;
}

export function ImageUploadPreview({ defaultImageUrls = [], label = "Product Images" }: ImageUploadPreviewProps) {
  // Existing images from DB
  const [existingImages, setExistingImages] = useState<string[]>(defaultImageUrls);
  // Removed existing images to be sent to backend
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  // Newly selected local files for preview
  const [newImagePreviews, setNewImagePreviews] = useState<{ url: string; file: File }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveExisting = (e: React.MouseEvent, urlToRemove: string) => {
    e.preventDefault();
    setExistingImages(prev => prev.filter(url => url !== urlToRemove));
    setRemovedImages(prev => [...prev, urlToRemove]);
  };

  const handleRemoveNew = (e: React.MouseEvent, indexToRemove: number) => {
    e.preventDefault();
    setNewImagePreviews(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[indexToRemove].url);
      updated.splice(indexToRemove, 1);
      return updated;
    });
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      
      {/* Hidden inputs to track removed existing images */}
      {removedImages.map((url, idx) => (
        <input key={idx} type="hidden" name="removeImages" value={url} />
      ))}
      
      {/* Hidden inputs to pass existing images that are KEPT */}
      {existingImages.map((url, idx) => (
        <input key={`keep-${idx}`} type="hidden" name="keepImages" value={url} />
      ))}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
        {/* Existing Images */}
        {existingImages.map((url, idx) => (
          <div key={`existing-${idx}`} className="relative border rounded-xl overflow-hidden group aspect-square">
            <Image 
              src={url} 
              alt={`Existing image ${idx + 1}`} 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
              <button 
                onClick={(e) => handleRemoveExisting(e, url)}
                className="bg-destructive text-white p-2 rounded-full hover:bg-destructive/90 transition-colors"
                title="Remove image"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {idx === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium z-10 shadow-sm">
                Primary
              </div>
            )}
          </div>
        ))}

        {/* New Image Previews */}
        {newImagePreviews.map((preview, idx) => (
          <div key={`new-${idx}`} className="relative border rounded-xl overflow-hidden group aspect-square">
            <Image 
              src={preview.url} 
              alt={`New preview ${idx + 1}`} 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
              <button 
                onClick={(e) => handleRemoveNew(e, idx)}
                className="bg-destructive text-white p-2 rounded-full hover:bg-destructive/90 transition-colors"
                title="Remove image"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {existingImages.length === 0 && idx === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium z-10 shadow-sm">
                Primary
              </div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        <div className="border-2 border-dashed rounded-xl relative hover:bg-muted/50 transition-colors aspect-square flex flex-col items-center justify-center cursor-pointer min-h-[120px]">
          <input 
            id="images" 
            name="images" 
            type="file" 
            accept="image/*" 
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          />
          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-xs font-medium text-center px-2">Click or drag images</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB each. You can select multiple files.</p>
    </div>
  );
}
