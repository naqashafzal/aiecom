"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const salePriceRaw = parseFloat(formData.get("salePrice") as string);
  const salePrice = isNaN(salePriceRaw) ? null : salePriceRaw;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const status = formData.get("status") as string;
  const categoryIds = formData.getAll("categoryIds") as string[];

  if (!name || !description || isNaN(price) || categoryIds.length === 0) {
    throw new Error("Missing required fields");
  }

  // Create slug from name
  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (await db.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const imageFile = formData.get("image") as File;
  let imageUrl: string | null = null;
  
  let uploadErrorMsg = "";
  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer();
      const safeName = imageFile.name ? imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
      const fileName = `${Date.now()}-${safeName}`;
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(uploadDir, fileName), new Uint8Array(bytes));
      imageUrl = `/uploads/${fileName}`;
    } catch (uploadError: any) {
      console.error("Failed to upload image during product creation:", uploadError);
      uploadErrorMsg = `\n\n[DEBUG UPLOAD ERROR]: ${uploadError.message} - Stack: ${uploadError.stack}`;
    }
  }

  const storeId = formData.get("storeId") as string;

  await db.product.create({
    data: {
      name,
      slug,
      description: description + uploadErrorMsg,
      price,
      salePrice,
      stock,
      status,
      storeId: storeId || null,
      categories: {
        connect: categoryIds.map(id => ({ id }))
      },
      images: imageUrl ? {
        create: {
          url: imageUrl,
          isPrimary: true
        }
      } : undefined
    }
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function getAllProductIds() {
  const products = await db.product.findMany({ select: { id: true } });
  return products.map(p => p.id);
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const salePriceRaw = parseFloat(formData.get("salePrice") as string);
  const salePrice = isNaN(salePriceRaw) ? null : salePriceRaw;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const status = formData.get("status") as string;
  const categoryIds = formData.getAll("categoryIds") as string[];

  if (!name || !description || isNaN(price) || categoryIds.length === 0) {
    throw new Error("Missing required fields");
  }

  const imageFile = formData.get("image") as File;
  const removeImage = formData.get("removeImage") === "true";
  
  let imageUrl: string | null = null;
  
  let uploadErrorMsg = "";
  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer();
      const safeName = imageFile.name ? imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
      const fileName = `${Date.now()}-${safeName}`;
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(uploadDir, fileName), new Uint8Array(bytes));
      imageUrl = `/uploads/${fileName}`;
    } catch (uploadError: any) {
      console.error("Failed to upload image during product update:", uploadError);
      uploadErrorMsg = `\n\n[DEBUG UPLOAD ERROR]: ${uploadError.message} - Stack: ${uploadError.stack}`;
    }
  }

  // Handle image updates
  if (imageUrl || removeImage) {
    // Delete existing images first
    await db.productImage.deleteMany({
      where: { productId: id }
    });
  }

  const storeId = formData.get("storeId") as string;

  await db.product.update({
    where: { id },
    data: {
      name,
      description: description + uploadErrorMsg,
      price,
      salePrice,
      stock,
      status,
      storeId: storeId || null,
      categories: {
        set: categoryIds.map(id => ({ id }))
      },
      ...(imageUrl ? {
        images: {
          create: {
            url: imageUrl,
            isPrimary: true
          }
        }
      } : {})
    }
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function bulkUpdateProductStatus(ids: string[], status: 'ACTIVE' | 'DRAFT') {
  if (!ids || ids.length === 0) return;
  await db.product.updateMany({
    where: { id: { in: ids } },
    data: { status }
  });
  revalidatePath("/admin/products");
}

export async function bulkUpdateProductPrices(ids: string[], field: 'price' | 'salePrice', operation: 'set' | 'increase_pct' | 'decrease_pct', value: number) {
  if (!ids || ids.length === 0) return;
  
  // Since updateMany doesn't easily support complex math on existing columns based on variable input in SQLite without raw queries,
  // and we want it to be reliable, we'll fetch them and update them in a transaction.
  const products = await db.product.findMany({
    where: { id: { in: ids } }
  });

  const updates = products.map(p => {
    let newValue = value;
    const currentValue = p[field] || p.price; // fallback to base price if salePrice is null
    
    if (operation === 'increase_pct') {
      newValue = currentValue * (1 + (value / 100));
    } else if (operation === 'decrease_pct') {
      newValue = currentValue * (1 - (value / 100));
    }

    return db.product.update({
      where: { id: p.id },
      data: { [field]: newValue }
    });
  });

  await db.$transaction(updates);
  revalidatePath("/admin/products");
}

export async function bulkUpdateProductStock(ids: string[], operation: 'set' | 'add' | 'subtract', value: number) {
  if (!ids || ids.length === 0) return;
  
  const products = await db.product.findMany({
    where: { id: { in: ids } }
  });

  const updates = products.map(p => {
    let newStock = value;
    const currentStock = p.stock || 0;
    
    if (operation === 'add') {
      newStock = currentStock + value;
    } else if (operation === 'subtract') {
      newStock = Math.max(0, currentStock - value); // Prevent negative stock
    }

    return db.product.update({
      where: { id: p.id },
      data: { stock: newStock }
    });
  });

  await db.$transaction(updates);
  revalidatePath("/admin/products");
}

export async function bulkDeleteProducts(ids: string[]) {
  if (!ids || ids.length === 0) return;
  
  // Handle relations first (images)
  await db.productImage.deleteMany({
    where: { productId: { in: ids } }
  });

  await db.product.deleteMany({
    where: { id: { in: ids } }
  });
  
  revalidatePath("/admin/products");
}

export async function deleteProduct(id: string) {
  await db.product.delete({
    where: { id }
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) throw new Error("Name is required");

  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (await db.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  let imageId = null;
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const safeName = imageFile.name ? imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
    const fileName = `${Date.now()}-cat-${safeName}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, fileName), Buffer.from(bytes));
    imageId = `/uploads/${fileName}`;
  }

  await db.category.create({
    data: {
      name,
      slug,
      description,
      imageId,
    }
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) throw new Error("Name is required");

  const imageFile = formData.get("image") as File;
  const removeImage = formData.get("removeImage") === "true";
  
  const updateData: any = {
    name,
    description,
  };

  if (removeImage) {
    updateData.imageId = null;
  } else if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const safeName = imageFile.name ? imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
    const fileName = `${Date.now()}-cat-${safeName}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, fileName), Buffer.from(bytes));
    updateData.imageId = `/uploads/${fileName}`;
  }

  await db.category.update({
    where: { id },
    data: updateData
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await db.category.delete({
    where: { id }
  });

  revalidatePath("/admin/categories");
}

export async function saveSettings(formData: FormData) {
  const entries = Array.from(formData.entries());
  
  for (const [key, value] of entries) {
    if (typeof value === "string") {
      await db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }
  }
  
  revalidatePath("/", "layout");
}

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const status = formData.get("status") as any;
  const paymentStatus = formData.get("paymentStatus") as string;
  
  const data: any = {};
  if (status) data.status = status;
  if (paymentStatus) data.paymentStatus = paymentStatus;
  
  if (Object.keys(data).length > 0) {
    await db.order.update({
      where: { id: orderId },
      data
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateUserRole(userId: string, newRole: "USER" | "ADMIN") {
  await db.user.update({
    where: { id: userId },
    data: { role: newRole }
  });
  revalidatePath("/admin/users");
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await db.user.delete({
    where: { id: userId }
  });
  revalidatePath("/admin/users");
}

export async function createCoupon(formData: FormData) {
  const code = formData.get("code") as string;
  const type = formData.get("type") as string;
  const value = parseFloat(formData.get("value") as string);
  const minOrderValue = parseFloat(formData.get("minOrderValue") as string) || null;
  const usageLimitRaw = parseInt(formData.get("usageLimit") as string);
  const usageLimit = isNaN(usageLimitRaw) ? null : usageLimitRaw;
  const expiresAtStr = formData.get("expiresAt") as string;
  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;
  const isActive = formData.get("isActive") === "true";

  if (!code || !type || isNaN(value)) {
    throw new Error("Missing required fields");
  }

  await db.coupon.create({
    data: {
      code: code.toUpperCase(),
      type,
      value,
      minOrderValue,
      usageLimit,
      expiresAt,
      isActive
    }
  });

  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function deleteCoupon(id: string) {
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/discounts");
}

export async function createShippingZone(formData: FormData) {
  const name = formData.get("name") as string;
  const countriesRaw = formData.get("countries") as string;
  
  if (!name || !countriesRaw) {
    throw new Error("Missing required fields");
  }

  // Expecting countries to be a comma-separated list of country codes, e.g., "US,CA,GB"
  const countries = countriesRaw.split(",").map(c => c.trim().toUpperCase()).filter(c => c);

  await db.shippingZone.create({
    data: {
      name,
      countries,
      isActive: true
    }
  });

  revalidatePath("/admin/shipping");
  redirect("/admin/shipping");
}

export async function deleteShippingZone(id: string) {
  await db.shippingZone.delete({ where: { id } });
  revalidatePath("/admin/shipping");
}

export async function createShippingRate(zoneId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const condition = formData.get("condition") as string; // "NONE", "PRICE", "WEIGHT"
  const minConditionRaw = parseFloat(formData.get("minCondition") as string);
  const maxConditionRaw = parseFloat(formData.get("maxCondition") as string);
  
  const minCondition = isNaN(minConditionRaw) ? null : minConditionRaw;
  const maxCondition = isNaN(maxConditionRaw) ? null : maxConditionRaw;

  if (!name || isNaN(price) || !condition) {
    throw new Error("Missing required fields");
  }

  await db.shippingRate.create({
    data: {
      name,
      price,
      condition,
      minCondition,
      maxCondition,
      zoneId,
      isActive: true
    }
  });

  revalidatePath(`/admin/shipping/${zoneId}`);
}

export async function deleteShippingRate(id: string, zoneId: string) {
  await db.shippingRate.delete({ where: { id } });
  revalidatePath(`/admin/shipping/${zoneId}`);
}

import { Resend } from "resend";

export async function testResendApi(apiKey: string, fromAddress: string, toAddress: string) {
  try {
    const keyToUse = apiKey || process.env.RESEND_API_KEY;
    if (!keyToUse) {
      return { success: false, error: "No API key provided or found in environment variables." };
    }

    const resend = new Resend(keyToUse);
    const { data, error } = await resend.emails.send({
      from: fromAddress || "onboarding@resend.dev",
      to: [toAddress],
      subject: "Test Email from ZS Decor Ecom",
      html: "<p>If you are receiving this, your Resend API configuration is working perfectly!</p>",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "An unknown error occurred" };
  }
}

export async function getAdminNotifications() {
  const session = await import("@/auth").then(m => m.auth());
  if (!session?.user?.id) return [];

  // Since admins can see all notifications meant for admins, maybe we just fetch by userId.
  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  });
  return notifications;
}

export async function markNotificationAsRead(id: string) {
  await db.notification.update({
    where: { id },
    data: { isRead: true }
  });
  revalidatePath("/admin");
}

export async function markAllNotificationsAsRead() {
  const session = await import("@/auth").then(m => m.auth());
  if (!session?.user?.id) return;

  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true }
  });
  revalidatePath("/admin");
}
