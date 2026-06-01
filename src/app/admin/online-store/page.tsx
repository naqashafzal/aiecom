import { db } from "@/lib/prisma";
import LiveThemeEditor from "./LiveThemeEditor";

export default async function OnlineStoreThemePage() {
  const settingsRecords = await db.setting.findMany({
    where: {
      key: {
        in: [
          "storefront_announcement_text",
          "storefront_hero_title",
          "storefront_hero_subtitle",
          "storefront_hero_image",
          "storefront_policy_1_title",
          "storefront_policy_1_desc",
          "storefront_policy_2_title",
          "storefront_policy_2_desc",
          "storefront_feature_1_title",
          "storefront_feature_1_desc",
          "storefront_show_announcement",
          "storefront_show_hero",
          "storefront_show_features",
          "storefront_show_products",
          "storefront_show_stores",
        ]
      }
    }
  });

  const settings = settingsRecords.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  return <LiveThemeEditor initialSettings={settings} />;
}
