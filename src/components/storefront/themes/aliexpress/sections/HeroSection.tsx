import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BlockRenderer } from "./BlockRenderer";

export function HeroSection({ settings, block_order = [], blocks = {} }: { settings: Record<string, any>, block_order?: string[], blocks?: Record<string, any> }) {
  const heroBgColor = settings["bg_color"] || "#0071FF";
  const heroCountdown = settings["countdown"] || "Jun 11, 11:59 (GMT+5)";
  const heroDiscount = settings["discount"] || "UP TO 80% OFF";
  const heroSideImage = settings["side_image"] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500";
  
  return (
    <div style={{ backgroundColor: heroBgColor }} className="w-full relative overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row justify-between relative">
        
        {/* Left Content */}
        <div className="flex-1 z-10">
          <div className="text-white font-bold text-sm md:text-base mb-4 tracking-wide">
            Sale Ends: {heroCountdown}
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight leading-none flex items-center gap-2">
              {heroDiscount} 
              <span className="bg-[#FFDD00] text-[#0071FF] rounded-full h-12 w-12 flex items-center justify-center text-3xl shrink-0 -mt-2">
                <ChevronRight className="h-8 w-8 stroke-[4px]" />
              </span>
            </h1>
          </div>

          {/* Dynamic Blocks Container */}
          <div className="flex flex-wrap items-stretch gap-3 mt-8">
            {block_order.map(id => {
              const block = blocks[id];
              if (!block) return null;
              return <BlockRenderer key={id} block={block} />;
            })}
          </div>
        </div>

        {/* Right Side Image Graphic */}
        <div className="hidden lg:flex w-[450px] shrink-0 items-center justify-end z-0 right-8 absolute bottom-0 h-full">
          <img src={heroSideImage} className="max-h-[120%] object-contain object-bottom -mb-10" alt="Summer Sale Graphic" />
        </div>

      </div>
    </div>
  );
}
