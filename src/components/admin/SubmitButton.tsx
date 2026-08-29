"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Save, Loader2, UploadCloud } from "lucide-react";

export function SubmitButton({ 
  defaultText = "Save Changes", 
  loadingText = "Uploading Media..." 
}: { 
  defaultText?: string, 
  loadingText?: string 
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <Button 
        type="submit" 
        disabled={pending} 
        className="px-8 rounded-full shadow-lg shadow-primary/25 relative overflow-hidden"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {defaultText}
          </>
        )}
      </Button>

      {pending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <UploadCloud className="h-8 w-8 text-primary animate-bounce" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold">Uploading to Cloud...</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we securely upload your images and videos. This may take a moment for large files.
              </p>
            </div>

            {/* Indeterminate Progress Bar */}
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-1/2 animate-[progress_1.5s_ease-in-out_infinite] origin-left" style={{ animationName: 'progress-indeterminate' }}></div>
            </div>
            
            <style jsx>{`
              @keyframes progress-indeterminate {
                0% { transform: translateX(-100%) scaleX(0.2); }
                50% { transform: translateX(0%) scaleX(0.5); }
                100% { transform: translateX(200%) scaleX(0.2); }
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
}
