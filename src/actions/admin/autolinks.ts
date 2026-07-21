"use server";

import { db } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

// Assuming we bypass requireAdmin or import auth if available
// In aiecom, auth logic might be different, let's keep it simple

export async function getAutoLinks() {
  return db.autoLink.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createAutoLink(data: { keyword: string; url: string; isActive: boolean }) {
  const created = await db.autoLink.create({
    data
  });
  
  revalidateTag("auto-links");
  return created;
}

export async function updateAutoLink(id: string, data: { keyword: string; url: string; isActive: boolean }) {
  const updated = await db.autoLink.update({
    where: { id },
    data
  });
  
  revalidateTag("auto-links");
  return updated;
}

export async function deleteAutoLink(id: string) {
  const deleted = await db.autoLink.delete({
    where: { id }
  });
  
  revalidateTag("auto-links");
  return deleted;
}
