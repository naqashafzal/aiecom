"use server";

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function generateAiBlogPost(title: string) {
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert ecommerce copywriter and SEO specialist for the ZS Decor store.
Write a highly engaging, SEO-optimized blog post based on the provided title/topic.
Return ONLY valid JSON with two fields: 'content' (the full blog post formatted in beautiful Markdown, including headings, lists, and bold text) and 'excerpt' (a 1-2 sentence compelling summary).
Do NOT wrap the output in markdown code blocks like \`\`\`json. Return RAW JSON.`,
      prompt: `Write a blog post about: "${title}"`
    });

    try {
      const parsed = JSON.parse(text);
      return { success: true, content: parsed.content, excerpt: parsed.excerpt };
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", text);
      return { success: false, error: "AI returned invalid JSON format." };
    }
  } catch (error: any) {
    console.error("Failed to generate blog post:", error);
    return { success: false, error: error.message };
  }
}

export async function generateAiProductDescription(name: string) {
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert ecommerce copywriter. 
Write a high-converting, persuasive, and detailed product description for the product name provided.
The description should highlight benefits, features, and use a premium tone.
Format the output using HTML (e.g., <p>, <ul>, <li>, <strong>) so it renders beautifully on the storefront.
Do NOT wrap the output in markdown code blocks like \`\`\`html. Return RAW HTML text.`,
      prompt: `Write a product description for: "${name}"`
    });

    return { success: true, description: text };
  } catch (error: any) {
    console.error("Failed to generate product description:", error);
    return { success: false, error: error.message };
  }
}
