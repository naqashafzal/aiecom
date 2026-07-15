"use server";

import { db } from "@/lib/prisma";

export async function getMoreProducts(skip: number, take: number) {
  return await db.product.findMany({
    where: { status: 'ACTIVE' },
    skip,
    take,
    orderBy: { price: 'asc' }, // match the existing order
    include: { images: true }
  });
}

export async function submitContactMessage(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { success: false, error: "Name, email, and message are required." };
  }

  try {
    await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      }
    });
    return { success: true };
  } catch (e: any) {
    console.error("Failed to submit contact message", e);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
