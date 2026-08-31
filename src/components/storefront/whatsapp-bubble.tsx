"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface WhatsAppBubbleProps {
  phoneNumber?: string;
  phoneNumber2?: string;
  label1?: string;
  label2?: string;
}

export function WhatsAppBubble({ phoneNumber, phoneNumber2, label1, label2 }: WhatsAppBubbleProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || (!phoneNumber && !phoneNumber2)) return null;

  const formatted1 = phoneNumber?.replace(/[^0-9]/g, "");
  const formatted2 = phoneNumber2?.replace(/[^0-9]/g, "");

  const hasTwo = !!formatted1 && !!formatted2;

  const WhatsappIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className="w-7 h-7"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  );

  return (
    <>
      {hasTwo && isOpen && (
        <div className="fixed bottom-[150px] md:bottom-[170px] right-6 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 p-4 z-[40] animate-in slide-in-from-bottom-5 w-72">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="font-bold text-gray-800">Contact Us on WhatsApp</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1 rounded-full transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <Link 
              href={`https://wa.me/${formatted1}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 hover:bg-[#E8F8F5] border border-transparent hover:border-[#A3E4D7] rounded-lg transition-all"
              onClick={() => setIsOpen(false)}
            >
              <div className="bg-[#25D366] text-white p-2 rounded-full">
                 <WhatsappIcon />
              </div>
              <div className="text-sm font-semibold text-gray-800">{label1 || "Sales & Support"}</div>
            </Link>
            <Link 
              href={`https://wa.me/${formatted2}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 hover:bg-[#E8F8F5] border border-transparent hover:border-[#A3E4D7] rounded-lg transition-all"
              onClick={() => setIsOpen(false)}
            >
              <div className="bg-[#25D366] text-white p-2 rounded-full">
                 <WhatsappIcon />
              </div>
              <div className="text-sm font-semibold text-gray-800">{label2 || "General Inquiries"}</div>
            </Link>
          </div>
        </div>
      )}

      {hasTwo ? (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-[80px] md:bottom-24 right-6 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:-translate-y-1 transition-all duration-300 z-[40] flex items-center justify-center animate-in slide-in-from-bottom-5"
        >
          {isOpen ? <X className="h-7 w-7" /> : <WhatsappIcon />}
        </button>
      ) : (
        <Link 
          href={`https://wa.me/${formatted1 || formatted2}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-[80px] md:bottom-24 right-6 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:-translate-y-1 transition-all duration-300 z-[40] flex items-center justify-center animate-in slide-in-from-bottom-5"
        >
          <WhatsappIcon />
        </Link>
      )}
    </>
  );
}
