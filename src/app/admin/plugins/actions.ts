"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function togglePluginStatus(identifier: string, name: string, description: string, version: string, enable: boolean) {
  try {
    await db.plugin.upsert({
      where: { identifier },
      update: { isActive: enable },
      create: {
        identifier,
        name,
        description: description || "",
        version,
        isActive: enable
      }
    });

    revalidatePath("/admin/plugins");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle plugin", error);
    return { success: false, error: "Database error" };
  }
}
