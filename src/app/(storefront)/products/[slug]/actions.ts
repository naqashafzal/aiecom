"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitProductReview(
  productId: string, 
  rating: number, 
  title: string, 
  comment: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to leave a review." };
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findFirst({
      where: {
        productId,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return { success: false, error: "You have already reviewed this product." };
    }

    await db.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        comment,
        isApproved: false // Requires admin approval by default
      }
    });

    revalidatePath(`/products`);
    revalidatePath(`/admin/reviews`);

    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "An error occurred while submitting your review." };
  }
}
