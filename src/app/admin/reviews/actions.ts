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

export async function generateFakeReviews(count: number = 10) {
  try {
    const products = await db.product.findMany({ select: { id: true } });
    let users = await db.user.findMany({ select: { id: true, name: true } });

    if (products.length === 0) {
      return { success: false, error: "No products found to review" };
    }

    if (users.length === 0) {
      // Create some fake users
      await db.user.createMany({
        data: Array.from({ length: 5 }).map((_, i) => ({
          name: `Fake User ${i + 1}`,
          email: `fake${Date.now()}_${i}@example.com`,
        }))
      });
      users = await db.user.findMany({ select: { id: true, name: true } });
    }

    const reviewTitles = ["Great product!", "Not bad", "Excellent quality", "Will buy again", "Disappointed"];
    const reviewComments = [
      "I really liked this product. It exceeded my expectations.",
      "It's okay, but could be better. The quality is decent.",
      "Absolutely fantastic! I highly recommend it.",
      "Very good value for the price. Happy with my purchase.",
      "Not what I expected. The description was misleading."
    ];

    const newReviews = Array.from({ length: count }).map(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const rating = Math.floor(Math.random() * 5) + 1;
      
      return {
        productId: randomProduct.id,
        userId: randomUser.id,
        rating,
        title: reviewTitles[Math.floor(Math.random() * reviewTitles.length)],
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        isApproved: Math.random() > 0.5
      };
    });

    await db.review.createMany({
      data: newReviews
    });

    revalidatePath("/admin/reviews");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to generate fake reviews:", error);
    return { success: false, error: "Failed to generate reviews" };
  }
}
