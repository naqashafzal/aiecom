"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVendorStore(formData: FormData) {
  const storeName = formData.get("storeName") as string;
  const storeSlug = formData.get("storeSlug") as string;
  const ownerEmail = formData.get("ownerEmail") as string;
  const description = formData.get("description") as string;

  if (!storeName || !storeSlug || !ownerEmail) {
    throw new Error("Missing required fields");
  }

  // 1. Find or create the user
  let user = await db.user.findUnique({
    where: { email: ownerEmail }
  });

  if (!user) {
    // Create a new user with default password or logic to send invite email.
    // For now, we'll create a basic user.
    user = await db.user.create({
      data: {
        email: ownerEmail,
        name: storeName + " Owner",
        role: "USER", // Vendors use the standard portal, or we could add a VENDOR role
      }
    });
  }

  // 2. Ensure user has a VendorProfile
  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: user.id }
  });

  if (!vendorProfile) {
    await db.vendorProfile.create({
      data: {
        userId: user.id,
        companyName: storeName,
        status: "APPROVED"
      }
    });
  }

  // 3. Create the Store
  const store = await db.store.create({
    data: {
      name: storeName,
      slug: storeSlug,
      description: description,
      ownerId: user.id,
    }
  });

  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}
