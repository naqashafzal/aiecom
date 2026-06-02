"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleReviewApproval(id: string, isApproved: boolean) {
  try {
    await db.review.update({
      where: { id },
      data: { isApproved }
    });
    revalidatePath("/admin/reviews");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle review approval:", error);
    return { success: false, error: "Failed to update review" };
  }
}

export async function deleteReview(id: string) {
  try {
    await db.review.delete({
      where: { id }
    });
    revalidatePath("/admin/reviews");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete review:", error);
    return { success: false, error: "Failed to delete review" };
  }
}
