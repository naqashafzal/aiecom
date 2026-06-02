import { db } from "@/lib/prisma";
import FooterEditorClient from "./FooterEditorClient";

export const dynamic = "force-dynamic";

export default async function FooterEditorPage() {
  const settingsRecords = await db.setting.findMany({
    where: { key: { startsWith: "footer_" } },
  });

  const settings = settingsRecords.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Footer Editor</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize your storefront footer — branding, links, social media, and newsletter.
        </p>
      </div>
      <FooterEditorClient initialSettings={settings} />
    </div>
  );
}
