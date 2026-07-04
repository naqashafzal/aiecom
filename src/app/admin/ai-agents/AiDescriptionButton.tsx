"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { generateAiProductDescription } from "./ai-actions";

export function AiDescriptionButton({ 
  titleInputId = "name", 
  descInputId = "description" 
}: { 
  titleInputId?: string, 
  descInputId?: string 
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const titleInput = document.getElementById(titleInputId) as HTMLInputElement;
    const descInput = document.getElementById(descInputId) as HTMLTextAreaElement;

    if (!titleInput || !descInput) {
      console.error("Could not find input elements");
      return;
    }

    const title = titleInput.value;
    if (!title.trim()) {
      alert("Please enter a product title first so the AI knows what to write about.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateAiProductDescription(title);
      if (res.success && res.description) {
        // We use a neat trick to update the value and trigger React's synthetic change event
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(descInput, res.description);
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        alert(res.error || "Failed to generate description.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      size="sm" 
      onClick={handleGenerate} 
      disabled={isGenerating}
      className="h-7 text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
    >
      {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
      {isGenerating ? "Generating..." : "Generate with AI"}
    </Button>
  );
}
