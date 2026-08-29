"use server";

import { db } from "@/lib/prisma";
import { getAIModel } from "@/lib/ai";
import { generateText } from "ai";
import { revalidatePath } from "next/cache";

export async function generateSeoMetadata(id: string, type: "PRODUCT" | "CATEGORY" | "PAGE" | "POST") {
  let title = "";
  let content = "";

  switch (type) {
    case "PRODUCT":
      const product = await db.product.findUnique({ where: { id } });
      if (!product) throw new Error("Product not found");
      title = product.name;
      content = product.description || "";
      break;
    case "CATEGORY":
      const category = await db.category.findUnique({ where: { id } });
      if (!category) throw new Error("Category not found");
      title = category.name;
      content = category.description || "";
      break;
    case "PAGE":
      const page = await db.page.findUnique({ where: { id } });
      if (!page) throw new Error("Page not found");
      title = page.title;
      content = page.content || "";
      break;
    case "POST":
      const post = await db.post.findUnique({ where: { id } });
      if (!post) throw new Error("Post not found");
      title = post.title;
      content = post.content || "";
      break;
    default:
      throw new Error("Invalid entity type");
  }

  const model = await getAIModel();

  const prompt = `You are an expert SEO specialist. Given the following ${type.toLowerCase()} from an e-commerce website, generate a highly optimized SEO meta title and meta description.

Title: ${title}
Content snippet: ${content.substring(0, 1500)}

Rules:
1. Meta Title must be under 60 characters and highly clickable.
2. Meta Description must be under 160 characters and include a call to action.
3. Return ONLY a JSON object in this exact format, with no markdown code blocks or extra text:
{"metaTitle": "Your Title Here", "metaDescription": "Your Description Here"}`;

  try {
    const { text } = await generateText({
      model,
      prompt,
    });

    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    }
    const result = JSON.parse(cleanedText);

    if (!result.metaTitle || !result.metaDescription) {
      throw new Error("AI returned invalid structure");
    }

    switch (type) {
      case "PRODUCT":
        await db.product.update({
          where: { id },
          data: { metaTitle: result.metaTitle, metaDescription: result.metaDescription },
        });
        revalidatePath(`/products/${id}`); // Assuming generic product path
        break;
      case "CATEGORY":
        await db.category.update({
          where: { id },
          data: { metaTitle: result.metaTitle, metaDescription: result.metaDescription },
        });
        revalidatePath(`/categories/${id}`);
        break;
      case "PAGE":
        await db.page.update({
          where: { id },
          data: { metaTitle: result.metaTitle, metaDescription: result.metaDescription },
        });
        break;
      case "POST":
        await db.post.update({
          where: { id },
          data: { metaTitle: result.metaTitle, metaDescription: result.metaDescription },
        });
        break;
    }

    revalidatePath("/admin/seo");
    
    return { success: true, ...result };
  } catch (error: any) {
    console.error("AI SEO Generation Error:", error);
    return { success: false, error: error.message };
  }
}

export async function saveSeoMetadata(id: string, type: "PRODUCT" | "CATEGORY" | "PAGE" | "POST", metaTitle: string, metaDescription: string) {
  switch (type) {
    case "PRODUCT":
      await db.product.update({ where: { id }, data: { metaTitle, metaDescription } });
      break;
    case "CATEGORY":
      await db.category.update({ where: { id }, data: { metaTitle, metaDescription } });
      break;
    case "PAGE":
      await db.page.update({ where: { id }, data: { metaTitle, metaDescription } });
      break;
    case "POST":
      await db.post.update({ where: { id }, data: { metaTitle, metaDescription } });
      break;
  }
  revalidatePath("/admin/seo");
  return { success: true };
}
