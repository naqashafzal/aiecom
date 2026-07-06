"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const salePrice = formData.get("salePrice") ? parseFloat(formData.get("salePrice") as string) : null;
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
  
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    imageUrl = `/uploads/${fileName}`;
  }

  const storeId = formData.get("storeId") as string;

  await db.product.create({
    data: {
      name,
      slug,
      description,
      price,
      salePrice,
      stock,
      status,
      ...(storeId ? { store: { connect: { id: storeId } } } : {}),
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
  const salePrice = formData.get("salePrice") ? parseFloat(formData.get("salePrice") as string) : null;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const status = formData.get("status") as string;
  const categoryIds = formData.getAll("categoryIds") as string[];

  if (!name || !description || isNaN(price) || categoryIds.length === 0) {
    throw new Error("Missing required fields");
  }

  const imageFile = formData.get("image") as File;
  const removeImage = formData.get("removeImage") === "true";
  
  let imageUrl: string | null = null;
  
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    imageUrl = `/uploads/${fileName}`;
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
      description,
      price,
      salePrice,
      stock,
      status,
      ...(storeId ? { store: { connect: { id: storeId } } } : { store: { disconnect: true } }),
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

  await db.category.create({
    data: {
      name,
      slug,
      description,
    }
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) throw new Error("Name is required");

  await db.category.update({
    where: { id },
    data: {
      name,
      description,
    }
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
