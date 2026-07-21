"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";

const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), { ssr: false });

interface RichTextEditorProps {
  id: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  required?: boolean;
}

export function RichTextEditor({ id, name, defaultValue, value, onChange, required }: RichTextEditorProps) {
  const isControlled = value !== undefined;
  
  const mdeOptions = useMemo(() => {
    return {
      spellChecker: false,
      hideIcons: ["guide", "fullscreen", "side-by-side"] as any,
      maxHeight: "500px",
      status: false,
      placeholder: "Write your content here in Markdown...",
    };
  }, []);

  return (
    <div className="prose max-w-none">
      <input type="hidden" name={name} value={isControlled ? value : (defaultValue || "")} id={id} required={required} />
      <SimpleMdeReact
        value={isControlled ? value : defaultValue}
        onChange={(val) => onChange && onChange(val)}
        options={mdeOptions}
      />
    </div>
  );
}
