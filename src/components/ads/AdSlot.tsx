"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  client?: string;
  slot?: string;
  format?: "auto" | "fluid" | "rectangle";
  responsive?: boolean;
  className?: string;
}

export function AdSlot({ 
  client,
  slot,
  format = "auto",
  responsive = true,
  className = ""
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  
  // Try to read from meta tags injected by layout.tsx if props aren't provided
  const resolvedClient = client || (typeof document !== "undefined" ? document.querySelector("meta[name='adsense-client']")?.getAttribute("content") : null) || "ca-pub-placeholder";
  const resolvedSlot = slot || (typeof document !== "undefined" ? document.querySelector("meta[name='adsense-slot']")?.getAttribute("content") : null) || "1234567890";

  const isDev = process.env.NODE_ENV === "development" || resolvedClient === "ca-pub-placeholder";

  useEffect(() => {
    if (!isDev && typeof window !== "undefined") {
      try {
        // Only push if the ad hasn't been initialized yet
        if (adRef.current && !adRef.current.hasAttribute('data-ad-status')) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [isDev]);

  if (isDev) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 overflow-hidden ${className}`} style={{ minHeight: '250px' }}>
        <span className="font-medium text-sm">Advertisement Space</span>
        <span className="text-xs mt-1 text-gray-400">AdSense (Placeholder)</span>
        <span className="text-xs mt-1 text-gray-400">{format} format</span>
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle block ${className}`}
      data-ad-client={resolvedClient}
      data-ad-slot={resolvedSlot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
