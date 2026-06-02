import { db } from "@/lib/prisma";
import LiveThemeEditor from "./LiveThemeEditor";

export default async function OnlineStoreThemePage() {
  const settingsRecords = await db.setting.findMany({
    where: {
      key: { startsWith: "storefront_" }
    }
  });

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' }
  });

  const settings = settingsRecords.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  return <LiveThemeEditor initialSettings={settings} categories={categories} />;
}
