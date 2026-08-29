/**
 * AI helper — reads the provider, API key, and model from DB settings first, then falls back to env var.
 * Supports both Google Gemini and Wavespeed AI.
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { db } from "@/lib/prisma";

export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
export const DEFAULT_WAVESPEED_MODEL = "wavespeed-1.5-pro"; // Example default model

/** Returns a model instance using the configured provider + API key + model from DB or env */
export async function getAIModel(modelOverride?: string) {
  let provider = "gemini";
  let apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  let modelId = modelOverride ?? DEFAULT_GEMINI_MODEL;

  try {
    const [providerSetting, geminiKey, geminiModel, wavespeedKey, wavespeedModel] = await Promise.all([
      db.setting.findUnique({ where: { key: "ai_provider" } }),
      db.setting.findUnique({ where: { key: "gemini_api_key" } }),
      db.setting.findUnique({ where: { key: "gemini_model" } }),
      db.setting.findUnique({ where: { key: "wavespeed_api_key" } }),
      db.setting.findUnique({ where: { key: "wavespeed_model" } }),
    ]);

    if (providerSetting?.value === "wavespeed") {
      provider = "wavespeed";
      apiKey = wavespeedKey?.value?.trim() || process.env.WAVESPEED_API_KEY;
      modelId = modelOverride ?? (wavespeedModel?.value?.trim() || DEFAULT_WAVESPEED_MODEL);
    } else {
      // Default to gemini
      if (geminiKey?.value?.trim()) {
        apiKey = geminiKey.value.trim();
      }
      if (!modelOverride && geminiModel?.value?.trim()) {
        modelId = geminiModel.value.trim();
      }
    }
  } catch {
    // If DB is unavailable, fall back to env/defaults (gemini)
  }

  if (provider === "wavespeed") {
    const wavespeed = createOpenAI({
      baseURL: "https://llm.wavespeed.ai/v1",
      apiKey: apiKey,
    });
    return wavespeed(modelId);
  }

  // Fallback / default to Gemini
  const google = createGoogleGenerativeAI({ apiKey });
  return google(modelId);
}
