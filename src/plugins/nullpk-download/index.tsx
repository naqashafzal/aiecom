"use client";

import { useSearchParams } from "next/navigation";
import { DownloadTimerClient } from "./timer-client";
import { Suspense } from "react";

function DownloadTimerWrapper() {
  const searchParams = useSearchParams();
  const downloadUrl = searchParams.get("downloadUrl");
  const duration = searchParams.get("duration");

  if (!downloadUrl) return null;

  return (
    <div className="mt-12 p-8 border rounded-2xl bg-muted/5">
      <h3 className="text-xl font-bold text-center mb-6">Your Download is Ready</h3>
      <DownloadTimerClient 
        targetUrl={downloadUrl} 
        durationSeconds={duration ? parseInt(duration, 10) : 30} 
        skipTimer={false} 
      />
    </div>
  );
}

function ProductDescriptionBottom() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading timer...</div>}>
      <DownloadTimerWrapper />
    </Suspense>
  );
}

const nullpkDownloadPlugin = {
  identifier: "nullpk-download",
  name: "NullpkWeb Download Integration",
  description: "Renders the download timer on product pages.",
  version: "1.0.0",
  components: {
    product_description_bottom: ProductDescriptionBottom
  }
};

export default nullpkDownloadPlugin;
