"use client";

import { useSearchParams } from "next/navigation";
import { DownloadTimerClient } from "./timer-client";
import { useEffect, useRef, Suspense } from "react";

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
    <div ref={containerRef} className="mt-12 p-8 border rounded-2xl bg-muted/5">
      <h3 className="text-xl font-bold text-center mb-6">Your Download is Ready</h3>
      <DownloadTimerClient 
        targetUrl={downloadUrl} 
        durationSeconds={duration ? parseInt(duration, 10) : 30} 
        skipTimer={false} 
      />
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
