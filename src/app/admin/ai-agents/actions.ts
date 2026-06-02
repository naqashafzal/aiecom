"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleAiAgent(agentKey: string, isEnabled: boolean) {
  try {
    await db.setting.upsert({
      where: { key: agentKey },
      update: { value: isEnabled ? "true" : "false" },
      create: { key: agentKey, value: isEnabled ? "true" : "false" }
    });
    revalidatePath("/admin/ai-agents");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle AI agent:", error);
    return { success: false };
  }
}
