"use client";

import { useState, useRef } from "react";
import { Bold, Italic, Heading2, List, Image as ImageIcon, Link2, Loader2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  id: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  required?: boolean;
}

export function RichTextEditor({ id, name, defaultValue, value, onChange, required }: RichTextEditorProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const content = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e.target.value);
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    if (!isControlled) setInternalValue(newText);
    onChange?.(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        insertText(`\n<img src="${data.url}" alt="${file.name}" className="w-full h-auto rounded-lg my-4" />\n`);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border rounded-md focus-within:ring-2 focus-within:ring-black/5 overflow-hidden">
      <div className="bg-gray-50 border-b p-2 flex items-center gap-1 flex-wrap">
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText("<b>", "</b>")} title="Bold"><Bold className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText("<i>", "</i>")} title="Italic"><Italic className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText("<h2>", "</h2>")} title="Heading 2"><Heading2 className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText("<ul>\n  <li>", "</li>\n</ul>")} title="Bulleted List"><List className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText('<a href="URL" className="text-blue-600 underline">', "</a>")} title="Insert Link"><Link2 className="h-4 w-4" /></Button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 relative" disabled={isUploading}>
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
          {isUploading ? "Uploading..." : "Upload Image"}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUploadImage} 
            accept="image/*" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            title="Upload Image"
          />
        </Button>
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={content}
        onChange={handleChange}
        required={required}
        rows={16}
        placeholder="Write your blog post content here (HTML supported)..."
        className="w-full p-3 border-0 focus:ring-0 font-mono text-sm resize-y outline-none"
      />
    </div>
  );
}
