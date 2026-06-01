"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateThemeSettings(formData: FormData) {
  const settings = [
    { key: "storefront_announcement_text", value: formData.get("announcementText") as string },
    { key: "storefront_hero_title", value: formData.get("heroTitle") as string },
    { key: "storefront_hero_subtitle", value: formData.get("heroSubtitle") as string },
    { key: "storefront_hero_image", value: formData.get("heroImage") as string },
    { key: "storefront_policy_1_title", value: formData.get("policy1Title") as string },
    { key: "storefront_policy_2_title", value: formData.get("policy2Title") as string },
    { key: "storefront_feature_1_title", value: formData.get("feature1Title") as string },
    { key: "storefront_feature_1_desc", value: formData.get("feature1Desc") as string },
    { key: "storefront_show_announcement", value: formData.get("show_announcement") as string },
    { key: "storefront_show_hero", value: formData.get("show_hero") as string },
    { key: "storefront_show_features", value: formData.get("show_features") as string },
    { key: "storefront_show_products", value: formData.get("show_products") as string },
    { key: "storefront_show_stores", value: formData.get("show_stores") as string },
  ];

  for (const setting of settings) {
    if (setting.value !== null) {
      await db.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/online-store");
  
  return { success: true };
}

export async function importThemeSettings(formData: FormData) {
  try {
    const rawData = formData.get("importedSettings") as string;
    const importedSettings = JSON.parse(rawData);
    
    // We only want to import keys that are strings
    for (const [key, value] of Object.entries(importedSettings)) {
      if (typeof value === 'string' && key.startsWith("storefront_")) {
        await db.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }
    
    revalidatePath("/");
    revalidatePath("/admin/online-store");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to parse or save theme" };
  }
}
