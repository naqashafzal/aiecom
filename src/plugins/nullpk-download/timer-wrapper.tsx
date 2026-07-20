"use client";

import { useSearchParams } from "next/navigation";
import { DownloadTimerClient } from "./timer-client";
import { useEffect, useRef, Suspense } from "react";
import { AdSlot } from "@/components/ads/AdSlot";

function TimerContent() {
  const searchParams = useSearchParams();
  const downloadUrl = searchParams.get("downloadUrl");
  const duration = searchParams.get("duration");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (downloadUrl && containerRef.current) {
      // Add a slight delay to allow the page layout to settle
      const timeoutId = setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [downloadUrl]);

  if (!downloadUrl) return null;

  return (
    <div ref={containerRef} className="mt-12 mb-12 flex flex-col items-center">
      {/* Top Ad */}
      <div className="w-full max-w-[728px] mb-8 flex flex-col items-center">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-medium">Advertisement</span>
        <AdSlot className="w-full min-h-[250px]" />
      </div>

      {/* Timer Box */}
      <div className="p-8 border-2 border-primary/10 rounded-2xl bg-white shadow-lg shadow-primary/5 w-full max-w-2xl">
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">Your Download is Ready</h3>
        <DownloadTimerClient 
          targetUrl={downloadUrl} 
          durationSeconds={duration ? parseInt(duration, 10) : 30} 
          skipTimer={false} 
        />
      </div>

      {/* Bottom Ad */}
      <div className="w-full max-w-[728px] mt-8 flex flex-col items-center">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-medium">Advertisement</span>
        <AdSlot className="w-full min-h-[250px]" />
      </div>
    </div>
  );
}

export function DownloadTimerWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading timer...</div>}>
      <TimerContent />
    </Suspense>
  );
}
