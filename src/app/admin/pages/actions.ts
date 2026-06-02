"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPage(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "true";

  if ((db as any).page) {
    await (db as any).page.create({
      data: { title, slug, content, isPublished }
    });
  } else {
    const id = Math.random().toString(36).substring(2, 15);
    await db.$executeRaw`INSERT INTO Page (id, title, slug, content, isPublished, createdAt, updatedAt) VALUES (${id}, ${title}, ${slug}, ${content}, ${isPublished ? 1 : 0}, NOW(), NOW())`;
  }

  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function updatePage(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "true";

  if ((db as any).page) {
    await (db as any).page.update({
      where: { id },
      data: { title, slug, content, isPublished }
    });
  } else {
    await db.$executeRaw`UPDATE Page SET title = ${title}, slug = ${slug}, content = ${content}, isPublished = ${isPublished ? 1 : 0}, updatedAt = NOW() WHERE id = ${id}`;
  }

  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function deletePage(id: string) {
  if ((db as any).page) {
    await (db as any).page.delete({ where: { id } });
  } else {
    await db.$executeRaw`DELETE FROM Page WHERE id = ${id}`;
  }
  revalidatePath("/admin/pages");
}
