"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to save items to your wishlist." };
  }

  try {
    const userId = session.user.id;

    // Find or create the user's wishlist
    let wishlist = await db.wishlist.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      wishlist = await db.wishlist.create({
        data: { userId }
      });
    }

    // Check if item already exists
    const existingItem = await db.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    });

    if (existingItem) {
      // Remove it
      await db.wishlistItem.delete({
        where: { id: existingItem.id }
      });
      revalidatePath("/", "layout");
      return { success: true, action: "removed" };
    } else {
      // Add it
      await db.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId
        }
      });
      revalidatePath("/", "layout");
      return { success: true, action: "added" };
    }
  } catch (error) {
    console.error("Failed to toggle wishlist:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getWishlistProductIds() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const wishlist = await db.wishlist.findUnique({
    where: { userId: session.user.id },
    include: { items: true }
  });

  return wishlist ? wishlist.items.map(item => item.productId) : [];
}
