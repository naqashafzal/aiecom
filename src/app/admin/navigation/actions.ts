"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateNavigation(jsonString: string) {
  await db.setting.upsert({
    where: { key: "storefront_main_menu" },
    update: { value: jsonString },
    create: { key: "storefront_main_menu", value: jsonString }
  });
  revalidatePath("/admin/navigation");
  revalidatePath("/");
}
