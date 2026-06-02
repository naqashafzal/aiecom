"use client";

import { useState, useTransition } from "react";
import { updateFooterSettings } from "./actions";
import { Save, Facebook, Instagram, Twitter, Youtube, Plus, Trash2, Eye, EyeOff } from "lucide-react";

type LinkItem = { label: string; url: string };

function parseLinks(raw: string): LinkItem[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function LinkEditor({ links, onChange }: { links: LinkItem[]; onChange: (l: LinkItem[]) => void }) {
  const add = () => onChange([...links, { label: "", url: "" }]);
  const remove = (i: number) => onChange(links.filter((_, idx) => idx !== i));
  const update = (i: number, field: "label" | "url", val: string) => {
    const updated = links.map((l, idx) => idx === i ? { ...l, [field]: val } : l);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {links.map((link, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Label (e.g. About Us)"
            value={link.label}
            onChange={e => update(i, "label", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <input
            type="text"
            placeholder="URL (e.g. /about)"
            value={link.url}
            onChange={e => update(i, "url", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button onClick={() => remove(i)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black border border-dashed border-gray-300 hover:border-gray-400 rounded-lg px-3 py-2 w-full justify-center transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Add Link
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h2 className="font-semibold text-sm text-gray-800">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

export default function FooterEditorClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [s, setS] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const set = (key: string, value: string) => setS(prev => ({ ...prev, [key]: value }));

  // Link column state
  const [col1Links, setCol1Links] = useState<LinkItem[]>(parseLinks(s["footer_col1_links"] || "[]"));
  const [col2Links, setCol2Links] = useState<LinkItem[]>(parseLinks(s["footer_col2_links"] || "[]"));
  const [col3Links, setCol3Links] = useState<LinkItem[]>(parseLinks(s["footer_col3_links"] || "[]"));

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      const allSettings = {
        ...s,
        footer_col1_links: JSON.stringify(col1Links),
        footer_col2_links: JSON.stringify(col2Links),
        footer_col3_links: JSON.stringify(col3Links),
      };
      Object.entries(allSettings).forEach(([k, v]) => formData.append(k, v ?? ""));
      await updateFooterSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Save bar */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm sticky top-4 z-10">
        <span className="text-sm text-gray-500">
          {saved ? <span className="text-green-600 font-semibold">✓ Changes saved!</span> : "Unsaved changes will be lost."}
        </span>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60 transition-colors"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Branding */}
      <Section title="Branding">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Store Name">
            <input
              type="text"
              value={s["footer_store_name"] || ""}
              onChange={e => set("footer_store_name", e.target.value)}
              placeholder="e.g. MyStore"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </Field>
          <Field label="Tagline">
            <input
              type="text"
              value={s["footer_tagline"] || ""}
              onChange={e => set("footer_tagline", e.target.value)}
              placeholder="e.g. Premium products, unbeatable prices."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </Field>
        </div>
        <Field label="Copyright Text" hint="Use {year} to auto-insert the current year.">
          <input
            type="text"
            value={s["footer_copyright"] || ""}
            onChange={e => set("footer_copyright", e.target.value)}
            placeholder="e.g. © {year} MyStore. All rights reserved."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </Field>
      </Section>

      {/* Design */}
      <Section title="Design">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Background Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={s["footer_bg_color"] || "#1a1a1a"}
                onChange={e => set("footer_bg_color", e.target.value)}
                className="h-9 w-9 rounded border border-gray-200 cursor-pointer p-0"
              />
              <input
                type="text"
                value={s["footer_bg_color"] || "#1a1a1a"}
                onChange={e => set("footer_bg_color", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </Field>
          <Field label="Text Color">
            <div className="flex gap-2">
              <input
                type="color"
                value={s["footer_text_color"] || "#a0a0a0"}
                onChange={e => set("footer_text_color", e.target.value)}
                className="h-9 w-9 rounded border border-gray-200 cursor-pointer p-0"
              />
              <input
                type="text"
                value={s["footer_text_color"] || "#a0a0a0"}
                onChange={e => set("footer_text_color", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </Field>
        </div>
      </Section>

      {/* Link Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section title="Column 1 — Shop">
          <Field label="Column Title">
            <input
              type="text"
              value={s["footer_col1_title"] || ""}
              onChange={e => set("footer_col1_title", e.target.value)}
              placeholder="e.g. Shop"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </Field>
          <Field label="Links">
            <LinkEditor links={col1Links} onChange={setCol1Links} />
          </Field>
        </Section>

        <Section title="Column 2 — Support">
          <Field label="Column Title">
            <input
              type="text"
              value={s["footer_col2_title"] || ""}
              onChange={e => set("footer_col2_title", e.target.value)}
              placeholder="e.g. Support"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </Field>
          <Field label="Links">
            <LinkEditor links={col2Links} onChange={setCol2Links} />
          </Field>
        </Section>

        <Section title="Column 3 — Company">
          <Field label="Column Title">
            <input
              type="text"
              value={s["footer_col3_title"] || ""}
              onChange={e => set("footer_col3_title", e.target.value)}
              placeholder="e.g. Company"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </Field>
          <Field label="Links">
            <LinkEditor links={col3Links} onChange={setCol3Links} />
          </Field>
        </Section>
      </div>

      {/* Newsletter */}
      <Section title="Newsletter Signup">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Show Newsletter Section</span>
          <button
            onClick={() => set("footer_show_newsletter", s["footer_show_newsletter"] === "false" ? "true" : "false")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${s["footer_show_newsletter"] === "false" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}
          >
            {s["footer_show_newsletter"] === "false" ? <><EyeOff className="h-3.5 w-3.5" /> Hidden</> : <><Eye className="h-3.5 w-3.5" /> Visible</>}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <input
              type="text"
              value={s["footer_newsletter_title"] || ""}
              onChange={e => set("footer_newsletter_title", e.target.value)}
              placeholder="e.g. Stay in the Loop"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </Field>
          <Field label="Subtitle">
            <input
              type="text"
              value={s["footer_newsletter_text"] || ""}
              onChange={e => set("footer_newsletter_text", e.target.value)}
              placeholder="e.g. Subscribe for deals and updates."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </Field>
        </div>
      </Section>

      {/* Social Media */}
      <Section title="Social Media Links">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Facebook">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              <input
                type="url"
                value={s["footer_social_facebook"] || ""}
                onChange={e => set("footer_social_facebook", e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </Field>
          <Field label="Instagram">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              <input
                type="url"
                value={s["footer_social_instagram"] || ""}
                onChange={e => set("footer_social_instagram", e.target.value)}
                placeholder="https://instagram.com/yourpage"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </Field>
          <Field label="Twitter / X">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              <input
                type="url"
                value={s["footer_social_twitter"] || ""}
                onChange={e => set("footer_social_twitter", e.target.value)}
                placeholder="https://twitter.com/yourpage"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </Field>
          <Field label="YouTube">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <input
                type="url"
                value={s["footer_social_youtube"] || ""}
                onChange={e => set("footer_social_youtube", e.target.value)}
                placeholder="https://youtube.com/yourchannel"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </Field>
        </div>
      </Section>
    </div>
  );
}
