"use client";

import { useState } from "react";
import { Upload, X, Video } from "lucide-react";

interface VideoUploadPreviewProps {
  defaultVideoUrl?: string | null;
}

export function VideoUploadPreview({ defaultVideoUrl }: VideoUploadPreviewProps) {
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(defaultVideoUrl || null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [videoLink, setVideoLink] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoPreviewUrl(URL.createObjectURL(file));
      setIsRemoved(false);
      setVideoLink(""); // clear link if file is uploaded
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    setVideoPreviewUrl(null);
    setIsRemoved(true);
    setVideoLink("");
    const input = document.getElementById("videoFile") as HTMLInputElement;
    if (input) input.value = "";
  };

  const isEmbeddable = (url: string) => {
    return url.includes("youtube.com") || 
           url.includes("youtu.be") || 
           url.includes("tiktok.com") || 
           url.includes("facebook.com") || 
           url.includes("fb.watch");
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
    }
    if (url.includes("tiktok.com")) {
      const match = url.match(/video\/(\d+)/);
      return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : url;
    }
    if (url.includes("facebook.com") || url.includes("fb.watch")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
    }
    return url;
  };

  return (
    <div className="space-y-4">
      {isRemoved && <input type="hidden" name="removeVideo" value="true" />}
      
      <div className={`border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/50 transition-colors relative flex-col items-center justify-center ${!videoPreviewUrl && !videoLink ? 'flex' : 'hidden'}`}>
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium mb-1">Click to upload a video</p>
        <p className="text-xs text-muted-foreground mb-3">MP4, WEBM up to 50MB</p>
        <input 
          id="videoFile"
          type="file" 
          name="videoFile" 
          accept="video/*" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
      </div>

      {/* Or external link */}
      {!videoPreviewUrl && (
        <div>
          <label className="block text-sm font-semibold mb-2">Or provide a Video Link (YouTube, Vimeo, etc.)</label>
          <input 
            type="url" 
            name="videoLink" 
            value={videoLink}
            onChange={(e) => {
              setVideoLink(e.target.value);
              setIsRemoved(false);
            }}
            placeholder="https://www.youtube.com/watch?v=... or TikTok/Facebook URL" 
            className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" 
          />
        </div>
      )}

      {/* Preview */}
      {(videoPreviewUrl || videoLink) && (
        <div className="relative border rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center group">
          {videoPreviewUrl ? (
            <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
          ) : isEmbeddable(videoLink) ? (
            <iframe 
              src={getEmbedUrl(videoLink)} 
              className="w-full h-full"
              style={{ border: "none", overflow: "hidden" }}
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          ) : (
            <div className="text-white text-center p-4">
              <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">External Video Link provided.</p>
              <a href={videoLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">{videoLink}</a>
            </div>
          )}
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button 
              onClick={handleRemove}
              className="bg-destructive text-white p-2 rounded-full hover:bg-destructive/90 transition-colors shadow-md"
              title="Remove video"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
