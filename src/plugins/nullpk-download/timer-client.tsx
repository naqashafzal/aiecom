"use client";

import { useEffect, useState } from "react";
import { Download, Crown } from "lucide-react";

export function DownloadTimerClient({ 
  targetUrl, 
  skipTimer, 
  durationSeconds 
}: { 
  targetUrl: string; 
  skipTimer: boolean; 
  durationSeconds: number;
}) {
  const [timeLeft, setTimeLeft] = useState(skipTimer ? 0 : durationSeconds);

  useEffect(() => {
    if (skipTimer || durationSeconds <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [skipTimer, durationSeconds]);

  if (timeLeft > 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 py-4">
        <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
          <svg className="w-full h-full -rotate-90 text-indigo-600/10 dark:text-indigo-900/30" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="6" 
              strokeLinecap="round"
              className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-linear drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / durationSeconds)}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-black text-indigo-600 dark:text-indigo-400">{timeLeft}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Seconds</span>
          </div>
        </div>
        
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 text-center px-4">
          Generating your secure download link...
        </p>

        <div className="mt-8 p-5 max-w-sm w-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800/50 flex flex-col md:flex-row items-center gap-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
            <Crown className="w-6 h-6 shrink-0" />
          </div>
          <div className="text-center md:text-left flex-1">
            <p className="text-sm font-black uppercase tracking-wider">Hate waiting?</p>
            <p className="text-xs font-medium mt-1">Premium members skip all timers instantly.</p>
          </div>
          {/* Note: since this is in e-commerce, it should point back to the download site or be fully removed. For now, assuming download site is on localhost:3000 */}
          <a href="http://localhost:3000/membership" className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-xs transition-colors rounded-xl text-center shadow-lg shadow-amber-500/20 active:scale-95">
            Upgrade
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-[2rem] flex items-center justify-center mb-2 text-green-600 dark:text-green-400 shadow-inner border border-green-100 dark:border-green-800/30">
        <Download className="w-10 h-10 animate-bounce" />
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-2xl font-black uppercase tracking-widest text-zinc-900 dark:text-white">
          Link Generated!
        </p>
        <p className="text-sm font-medium text-zinc-500">Click the button below to start your download.</p>
      </div>

      <a 
        href={`http://localhost:3000${targetUrl}`} // Assuming targetUrl is relative to download site
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex flex-col items-center justify-center gap-2 px-12 py-6 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-black uppercase tracking-widest transition-all rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 active:translate-y-1 overflow-hidden mt-4 w-full md:w-auto"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <div className="flex items-center gap-3 relative z-10">
          <Download className="w-6 h-6" />
          <span className="text-lg">Download File</span>
        </div>
        <span className="text-[10px] font-medium opacity-60 relative z-10 tracking-widest">Secure Server Download</span>
      </a>
    </div>
  );
}
