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

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export interface GenerateFakeReviewsOptions {
  count?: number;
  productId?: string | null;
  sentiment?: "positive" | "neutral" | "negative" | "random";
  useAI?: boolean;
  autoApprove?: boolean;
}

export async function generateFakeReviews(options: GenerateFakeReviewsOptions = {}) {
  const {
    count = 10,
    productId = null,
    sentiment = "random",
    useAI = false,
    autoApprove = undefined,
  } = options;

  try {
    const productQuery = productId ? { where: { id: productId } } : {};
    const products = await db.product.findMany({ ...productQuery, select: { id: true, name: true, description: true } });
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

    let generatedReviews: { title: string; comment: string; rating: number; productId: string }[] = [];

    if (useAI && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const productSamples = products.slice(0, 3).map(p => `- ${p.name}: ${p.description?.substring(0, 50) || ""}`).join("\n");
        
        const sentimentPrompt = sentiment === "random" ? "mixed sentiments (some positive, some negative, some neutral)" : `strictly ${sentiment} sentiment`;
        
        const { object } = await generateObject({
          model: google("gemini-2.5-pro"),
          schema: z.object({
            reviews: z.array(z.object({
              title: z.string().describe("A catchy short title for the review"),
              comment: z.string().describe("A realistic sounding review comment, 1-3 sentences"),
              rating: z.number().min(1).max(5).describe("A rating from 1 to 5 stars, matching the sentiment"),
              productIndex: z.number().describe("The index of the product being reviewed from the provided list (0 to " + (products.length - 1) + ")")
            })).length(Math.min(count, 20)) // Limit AI gen to 20 at a time to prevent timeout
          }),
          prompt: `Generate ${Math.min(count, 20)} realistic fake reviews for an e-commerce store. 
          The reviews should have ${sentimentPrompt}. 
          
          Here are the products you are reviewing:
          ${products.map((p, i) => `[${i}] ${p.name}`).join("\n")}
          
          Make the reviews sound like real humans wrote them. Mention the product name or its features occasionally.`
        });

        generatedReviews = object.reviews.map(r => ({
          title: r.title,
          comment: r.comment,
          rating: r.rating,
          productId: products[r.productIndex] ? products[r.productIndex].id : products[0].id
        }));
        
        // If we need more than 20, fallback to standard generation for the rest
        if (count > 20) {
          console.warn("AI generation limited to 20 reviews per batch. Falling back to templates for the rest.");
        }
      } catch (aiError) {
        console.error("AI Generation failed, falling back to templates:", aiError);
      }
    }

    // Fill the rest with templates if AI didn't generate enough or failed/was disabled
    const remainingCount = count - generatedReviews.length;
    
    if (remainingCount > 0) {
      const positiveTitles = ["Great product!", "Excellent quality", "Will buy again", "Love it!"];
      const neutralTitles = ["Not bad", "It's okay", "Decent for the price", "Average"];
      const negativeTitles = ["Disappointed", "Not what I expected", "Poor quality", "Do not buy"];
      
      const positiveComments = ["I really liked this product. It exceeded my expectations.", "Absolutely fantastic! I highly recommend it.", "Very good value for the price. Happy with my purchase."];
      const neutralComments = ["It's okay, but could be better. The quality is decent.", "Does the job, nothing special.", "It's average. Might look for alternatives next time."];
      const negativeComments = ["Not what I expected. The description was misleading.", "Broke after a few uses. Very disappointed.", "Terrible quality. I want a refund."];

      for (let i = 0; i < remainingCount; i++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        
        let targetSentiment = sentiment;
        if (sentiment === "random") {
          const r = Math.random();
          targetSentiment = r < 0.6 ? "positive" : (r < 0.8 ? "neutral" : "negative");
        }
        
        let titleOptions, commentOptions, ratingOptions;
        
        if (targetSentiment === "positive") {
          titleOptions = positiveTitles;
          commentOptions = positiveComments;
          ratingOptions = [4, 5];
        } else if (targetSentiment === "neutral") {
          titleOptions = neutralTitles;
          commentOptions = neutralComments;
          ratingOptions = [3];
        } else {
          titleOptions = negativeTitles;
          commentOptions = negativeComments;
          ratingOptions = [1, 2];
        }

        generatedReviews.push({
          productId: randomProduct.id,
          title: titleOptions[Math.floor(Math.random() * titleOptions.length)],
          comment: commentOptions[Math.floor(Math.random() * commentOptions.length)],
          rating: ratingOptions[Math.floor(Math.random() * ratingOptions.length)],
        });
      }
    }

    const newReviews = generatedReviews.map(r => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      return {
        productId: r.productId,
        userId: randomUser.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isApproved: autoApprove !== undefined ? autoApprove : Math.random() > 0.5
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
