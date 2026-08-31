"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Assuming we bypass requireAdmin or import auth if available
// In aiecom, auth logic might be different, let's keep it simple

export async function getAutoLinks() {
  const session = await import("@/auth").then(m => m.auth());
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  return db.autoLink.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createAutoLink(data: { keyword: string; url: string; isActive: boolean }) {
  const session = await import("@/auth").then(m => m.auth());
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  const created = await db.autoLink.create({
    data
  });
  
  revalidatePath("/admin/auto-links");
  return created;
}

export async function updateAutoLink(id: string, data: { keyword: string; url: string; isActive: boolean }) {
  const session = await import("@/auth").then(m => m.auth());
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  const updated = await db.autoLink.update({
    where: { id },
    data
  });
  
  revalidatePath("/admin/auto-links");
  return updated;
}

export async function deleteAutoLink(id: string) {
  const session = await import("@/auth").then(m => m.auth());
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
  const deleted = await db.autoLink.delete({
    where: { id }
  });
  
  revalidatePath("/admin/auto-links");
  return deleted;
}

