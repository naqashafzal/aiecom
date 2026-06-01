"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const salePrice = formData.get("salePrice") ? parseFloat(formData.get("salePrice") as string) : null;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const status = formData.get("status") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!name || !description || isNaN(price) || !categoryId) {
    throw new Error("Missing required fields");
  }

  // Create slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

  await db.product.create({
    data: {
      name,
      slug,
      description,
      price,
      salePrice,
      stock,
      status,
      categoryId,
    }
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const salePrice = formData.get("salePrice") ? parseFloat(formData.get("salePrice") as string) : null;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const status = formData.get("status") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!name || !description || isNaN(price) || !categoryId) {
    throw new Error("Missing required fields");
  }

  await db.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      salePrice,
      stock,
      status,
      categoryId,
    }
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
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

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

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

export async function deleteCategory(id: string) {
  await db.category.delete({
    where: { id }
  });

  revalidatePath("/admin/categories");
}
