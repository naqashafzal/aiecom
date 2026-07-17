import Image from "next/image";
import Link from "next/link";

/**
 * Dynamic logo component that displays an image or text logo based on settings.
 */
export function StoreLogo({ 
  className = "",
  logoUrl,
  logoText = "ZS Decor",
  logoHeight = 40,
  logoAccent = "#f97316"
}: { 
  className?: string;
  logoUrl?: string;
  logoText?: string;
  logoHeight?: number;
  logoAccent?: string;
}) {
  return (
    <Link href="/" className={`flex items-center shrink-0 ${className}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={logoText}
          style={{ height: `${logoHeight}px`, width: "auto", objectFit: "contain" }}
        />
      ) : (
        <span className="font-black text-3xl tracking-tighter">
          {logoText}
          <span style={{ color: logoAccent }}>.</span>
        </span>
      )}
    </Link>
  );
}
