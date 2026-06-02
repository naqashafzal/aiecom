import { db } from "@/lib/prisma";
import NavigationClient from "./NavigationClient";

export default async function AdminNavigation() {
  const menuSetting = await db.setting.findUnique({ where: { key: "storefront_main_menu" } });
  
  let menuLinks = [];
  try {
    if (menuSetting?.value) {
      menuLinks = JSON.parse(menuSetting.value);
    }
  } catch (e) {
    console.error(e);
  }

  // Fetch available pages to show as options in the builder
  let pages: any[] = [];
  if ((db as any).page) {
    pages = await (db as any).page.findMany({
      select: { id: true, title: true, slug: true },
      where: { isPublished: true }
    });
  } else {
    pages = await db.$queryRaw`SELECT id, title, slug FROM Page WHERE isPublished = true OR isPublished = 1`;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Navigation Menu Builder</h1>
        <p className="text-gray-500 mt-1">Manage the links that appear in your storefront header.</p>
      </div>

      <NavigationClient initialLinks={menuLinks} pages={pages} />
    </div>
  );
}
