"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateThemeSettings(formData: FormData) {
  const entries = Array.from(formData.entries());
  
  for (const [key, value] of entries) {
    if (typeof value === "string" && key.startsWith("storefront_")) {
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
