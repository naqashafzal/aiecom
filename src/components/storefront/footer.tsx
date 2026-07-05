import Link from "next/link";
import { db } from "@/lib/prisma";

type LinkItem = { label: string; url: string };

function parseLinks(raw: string | undefined): LinkItem[] {
  try { return JSON.parse(raw || "[]"); } catch { return []; }
}

export async function Footer() {
  // Fetch all footer settings from DB
  const settingsRecords = await db.setting.findMany({
    where: { key: { startsWith: "footer_" } },
  });
  const s = settingsRecords.reduce((acc: Record<string, string>, r: any) => {
    acc[r.key] = r.value;
    return acc;
  }, {} as Record<string, string>);

  const storeName   = s["footer_store_name"] || "Aura";
  const tagline     = s["footer_tagline"]    || "Experience the next generation of modern, fast, and engaging ecommerce. Premium products at your fingertips.";
  const copyright   = (s["footer_copyright"] || "© {year} Aura Store. All rights reserved.").replace("{year}", String(new Date().getFullYear()));
  const bgColor     = s["footer_bg_color"]   || "";
  const textColor   = s["footer_text_color"] || "";
  const showNewsletter = s["footer_show_newsletter"] !== "false";

  const col1Title = s["footer_col1_title"] || "Shop";
  const col2Title = s["footer_col2_title"] || "Support";
  const col3Title = s["footer_col3_title"] || "Company";

  const col1Links = parseLinks(s["footer_col1_links"]).length > 0
    ? parseLinks(s["footer_col1_links"])
    : [
        { label: "All Categories", url: "/products" },
        { label: "Flash Deals", url: "/deals" },
        { label: "New Arrivals", url: "/products" },
        { label: "Trending Now", url: "/products" },
      ];

  const col2Links = parseLinks(s["footer_col2_links"]).length > 0
    ? parseLinks(s["footer_col2_links"])
    : [
        { label: "FAQ", url: "/faq" },
        { label: "Shipping & Returns", url: "/shipping" },
        { label: "Contact Us", url: "/contact" },
        { label: "Track Order", url: "/track" },
      ];

  const col3Links = parseLinks(s["footer_col3_links"]);

  const newsletterTitle = s["footer_newsletter_title"] || "Newsletter";
  const newsletterText  = s["footer_newsletter_text"]  || "Subscribe to get special offers, free giveaways, and updates.";

  const socials = {
    facebook:  s["footer_social_facebook"],
    instagram: s["footer_social_instagram"],
    twitter:   s["footer_social_twitter"],
    youtube:   s["footer_social_youtube"],
  };
  const hasSocials = Object.values(socials).some(Boolean);

  return (
    <footer
      className="border-t mt-auto"
      style={{
        backgroundColor: bgColor || undefined,
        color: textColor || undefined,
      }}
    >
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-12 ${!bgColor ? "bg-muted" : ""}`}>
        <div className={`grid gap-8 ${showNewsletter ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>

          {/* Branding */}
          <div>
            <Link href="/" className="font-bold text-2xl tracking-tighter" style={{ color: textColor ? "#fff" : undefined }}>
              {storeName}<span className="text-primary">.</span>
            </Link>
            <p className="mt-4 text-sm" style={{ color: textColor || undefined, opacity: textColor ? 0.7 : undefined }}>
              {tagline}
            </p>
            {hasSocials && (
              <div className="flex gap-3 mt-5">
                {socials.facebook  && <a href={socials.facebook}  target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors" style={{ backgroundColor: textColor ? "rgba(255,255,255,0.1)" : undefined }}><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg></a>}
                {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors" style={{ backgroundColor: textColor ? "rgba(255,255,255,0.1)" : undefined }}><svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>}
                {socials.twitter   && <a href={socials.twitter}   target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors" style={{ backgroundColor: textColor ? "rgba(255,255,255,0.1)" : undefined }}><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>}
                {socials.youtube   && <a href={socials.youtube}   target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors" style={{ backgroundColor: textColor ? "rgba(255,255,255,0.1)" : undefined }}><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>}
              </div>
            )}
          </div>

          {/* Column 1 */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: textColor ? "#fff" : undefined }}>{col1Title}</h3>
            <ul className="space-y-2 text-sm">
              {col1Links.map((link, i) => (
                <li key={i}>
                  <Link href={link.url} className="hover:text-primary transition-colors" style={{ color: textColor || undefined, opacity: textColor ? 0.7 : undefined }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: textColor ? "#fff" : undefined }}>{col2Title}</h3>
            <ul className="space-y-2 text-sm">
              {col2Links.map((link, i) => (
                <li key={i}>
                  <Link href={link.url} className="hover:text-primary transition-colors" style={{ color: textColor || undefined, opacity: textColor ? 0.7 : undefined }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 (only if has links) */}
          {col3Links.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4" style={{ color: textColor ? "#fff" : undefined }}>{col3Title}</h3>
              <ul className="space-y-2 text-sm">
                {col3Links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.url} className="hover:text-primary transition-colors" style={{ color: textColor || undefined, opacity: textColor ? 0.7 : undefined }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter */}
          {showNewsletter && (
            <div>
              <h3 className="font-semibold mb-4" style={{ color: textColor ? "#fff" : undefined }}>{newsletterTitle}</h3>
              <p className="text-sm mb-4" style={{ color: textColor || undefined, opacity: textColor ? 0.7 : undefined }}>
                {newsletterText}
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Subscribe
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm" style={{ borderColor: textColor ? "rgba(255,255,255,0.1)" : undefined }}>
          <p style={{ color: textColor || undefined, opacity: textColor ? 0.5 : undefined }}>
            {copyright}
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-primary transition-colors text-muted-foreground">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-primary transition-colors text-muted-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
