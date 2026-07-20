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
import { getAIModel } from "@/lib/ai";
import { z } from "zod";

// Large pool of common Pakistani first + last names
const PAKISTANI_NAMES = [
  "Ali Hassan", "Usman Khan", "Bilal Ahmed", "Hamza Sheikh", "Faisal Raza",
  "Zubair Malik", "Asad Qureshi", "Omer Farooq", "Saad Iqbal", "Talha Butt",
  "Adnan Mirza", "Kamran Siddiqui", "Junaid Nawaz", "Fahad Chaudhry", "Waqar Aslam",
  "Imran Javed", "Raza Hussain", "Nasir Baig", "Tariq Mehmood", "Shoaib Akhtar",
  "Ayesha Noor", "Sana Malik", "Fatima Zahra", "Zara Ahmed", "Nadia Iqbal",
  "Hira Butt", "Madiha Khan", "Nimra Shahid", "Sadia Qureshi", "Rabia Siddiqui",
  "Amna Rizvi", "Mehwish Hayat", "Iqra Aziz", "Sara Tariq", "Layla Farooq",
  "Bushra Ansari", "Mariam Sheikh", "Kiran Akhtar", "Asma Javed", "Nabeela Chaudhry",
  "Danish Rehman", "Khurram Abbas", "Shahzad Amin", "Muneeb Ur Rehman", "Zain Ul Abidin",
  "Babar Azam", "Shahid Afridi", "Muhammad Rizwan", "Shan Masood", "Yasir Shah",
  "Aliya Batool", "Rida Fatima", "Sumbul Iqbal", "Tooba Baig", "Uzma Nazir",
  "Haroon Khalil", "Nauman Ijaz", "Feroze Khan", "Yasir Hussain", "Ahsan Khan",
];

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
    const products = await db.product.findMany({
      ...productQuery,
      select: { id: true, name: true, description: true }
    });

    if (products.length === 0) {
      return { success: false, error: "No products found to review" };
    }

    // Always create fresh Pakistani-named fake users for this batch
    const shuffledNames = [...PAKISTANI_NAMES].sort(() => Math.random() - 0.5).slice(0, Math.min(count, PAKISTANI_NAMES.length));
    const createdUsers: { id: string }[] = [];

    for (const name of shuffledNames) {
      try {
        const user = await db.user.create({
          data: {
            name,
            email: `${name.toLowerCase().replace(/\s+/g, ".")}${Date.now()}${Math.floor(Math.random() * 999)}@gmail.com`,
          }
        });
        createdUsers.push(user);
      } catch {
        // If name already exists as email, skip
      }
    }

    // Fallback to any existing users if creation failed for all
    const users = createdUsers.length > 0
      ? createdUsers
      : await db.user.findMany({ select: { id: true } });

    if (users.length === 0) {
      return { success: false, error: "Could not create reviewer accounts" };
    }

    let generatedReviews: { title: string; comment: string; rating: number; productId: string }[] = [];

    if (useAI) {
      try {
        const aiModel = await getAIModel("gemini-2.5-pro");

        const sentimentPrompt =
          sentiment === "random" ? "mixed (kuch positive, kuch neutral, kuch negative)" :
          sentiment === "positive" ? "positive — customer khush hai, product pasand aya" :
          sentiment === "neutral" ? "neutral — theek thak hai, kuch khas nahi" :
          "negative — customer disappointed hai, product expectation se kam nikla";

        // Pass real product details so AI can write product-specific reviews
        const productList = products.map((p, i) =>
          `[${i}] Product: "${p.name}"\n    Description: ${p.description?.replace(/<[^>]+>/g, "").substring(0, 120) || "N/A"}`
        ).join("\n\n");

        const { object } = await generateObject({
          model: aiModel,
          schema: z.object({
            reviews: z.array(z.object({
              title: z.string().describe("Ek chhoti catchy title Roman Urdu mein, jaise 'Bohat acha product hai' ya 'Bilkul bekaar'"),
              comment: z.string().describe("2-3 sentences Roman Urdu mein, asli human ki tarah likhi — product ki koi feature mention karo, apna tajruba batao. Mixing of Urdu and English is fine (Hinglish/Roman Urdu style)."),
              rating: z.number().int().min(1).max(5).describe("Stars 1-5, sentiment ke mutabiq"),
              productIndex: z.number().int().min(0).max(products.length - 1).describe("Index of the product being reviewed from the list above"),
            })).length(Math.min(count, 20)),
          }),
          prompt: `Tu ek Pakistani online shopper hai jo ZS Decor ke products khareed ke reviews likh raha hai.
Sentiment chahiye: ${sentimentPrompt}.

Har review Roman Urdu mein likho — bilkul aise jaise koi asli Pakistani customer likhta hai. Mixed Urdu-English (Hinglish) theek hai.
Product ka naam ya uski koi feature zaroor mention karo. Generic mat likho.

Ye products hain jo review karne hain:
${productList}

${Math.min(count, 20)} reviews generate karo, alag alag products ke liye (agar multiple products hain to randomly distribute karo).`,
        });

        generatedReviews = object.reviews.map(r => ({
          title: r.title,
          comment: r.comment,
          rating: r.rating,
          productId: products[r.productIndex]?.id ?? products[0].id,
        }));

        if (count > 20) {
          console.warn("AI generation limited to 20 reviews per batch. Using templates for the rest.");
        }
      } catch (aiError) {
        console.error("AI Generation failed, falling back to templates:", aiError);
      }
    }

    // Template fallback — Roman Urdu style
    const remainingCount = count - generatedReviews.length;

    if (remainingCount > 0) {
      const positiveTitles = ["Bohat acha product hai!", "Zabardast quality!", "Dobara zaroor lunga", "Bilkul sahi purchase!", "100% recommend!", "Maza aa gaya!"];
      const neutralTitles = ["Theek thak hai", "Kuch khas nahi", "Average quality", "Price ke mutabiq thik hai", "Nah bura nah acha"];
      const negativeTitles = ["Bilkul bekaar", "Khwaab dikhaya, naqsa alag nikla", "Paisa waste hua", "Delivery mein bhi delay", "Nahi kharidna chahiye tha"];

      const positiveComments = [
        (name: string) => `Yaar ${name} ne suggest kiya tha, bilkul sahi kaha. Product bohat acha hai, quality se khush hun. Fast delivery bhi mili!`,
        (name: string) => `Expect nahi tha itna acha hoga. Packing bhi achi thi aur product original nikla. ZS Decor se pehli baar order kiya, dobara karunga inshallah.`,
        (name: string) => `Dil khush ho gaya! Jo picture mein dikh raha tha bilkul waisa hi mila. Value for money hai yeh product. Highly recommend!`,
        (name: string) => `Quality dekhke main toh hairan reh gaya. Ghar mein sabko pasand aaya. Rating 5/5 dene ka dil karta hai.`,
        (name: string) => `Bohat purana customer hun is site ka, aaj tak disappoint nahi kiya. Is product ne bhi umeed par khara utra.`,
      ];
      const neutralComments = [
        (name: string) => `Theek hai product, kuch khas nahi lekin kaam chala leta hai. Price ke hisaab se acceptable hai. Delivery time thoda lamba tha.`,
        (name: string) => `Nah bahut acha nah bahut bura. Average quality hai. Shayad next time koi aur option try karun.`,
        (name: string) => `Jo expect kiya tha us se thoda kam nikla. Lekin phir bhi use kiya ja sakta hai. Waqt batayega kitna tika rehta hai.`,
      ];
      const negativeComments = [
        (name: string) => `Yaar picture mein kuch aur tha, haath mein kuch aur aaya. Bilkul fake hai. Paise waste ho gaye. Koi mat kharido yeh.`,
        (name: string) => `Delivery mein 2 hafte lage aur product bhi damage tha andar se. Customer service se baat ki, koi response nahi. Bahut bura tajruba.`,
        (name: string) => `Quality bahut ghatiya hai. 2 din mein hi kharab ho gaya. Return karna chahta hun lekin process bhi complicated hai.`,
      ];

      for (let i = 0; i < remainingCount; i++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];

        let targetSentiment = sentiment;
        if (sentiment === "random") {
          const r = Math.random();
          targetSentiment = r < 0.65 ? "positive" : r < 0.82 ? "neutral" : "negative";
        }

        let titleOptions: string[], commentFns: ((n: string) => string)[], ratingOptions: number[];

        if (targetSentiment === "positive") {
          titleOptions = positiveTitles;
          commentFns = positiveComments;
          ratingOptions = [4, 5, 5, 5];
        } else if (targetSentiment === "neutral") {
          titleOptions = neutralTitles;
          commentFns = neutralComments;
          ratingOptions = [3];
        } else {
          titleOptions = negativeTitles;
          commentFns = negativeComments;
          ratingOptions = [1, 2];
        }

        const randomName = PAKISTANI_NAMES[Math.floor(Math.random() * PAKISTANI_NAMES.length)].split(" ")[0];
        const commentFn = commentFns[Math.floor(Math.random() * commentFns.length)];

        generatedReviews.push({
          productId: randomProduct.id,
          title: titleOptions[Math.floor(Math.random() * titleOptions.length)],
          comment: commentFn(randomName),
          rating: ratingOptions[Math.floor(Math.random() * ratingOptions.length)],
        });
      }
    }

    // Assign each review a unique Pakistani-named user
    const newReviews = generatedReviews.map((r, i) => {
      const user = users[i % users.length];
      return {
        productId: r.productId,
        userId: user.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isApproved: autoApprove !== undefined ? autoApprove : Math.random() > 0.5,
      };
    });

    await db.review.createMany({ data: newReviews });

    revalidatePath("/admin/reviews");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to generate fake reviews:", error);
    return { success: false, error: "Failed to generate reviews" };
  }
}

