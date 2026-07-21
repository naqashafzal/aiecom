/**
 * AI helper — reads the Gemini API key and model from DB settings first, then falls back to env var.
 * This lets admins configure it from the Settings page without needing server access.
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db } from "@/lib/prisma";

export const DEFAULT_MODEL = "gemini-2.0-flash-lite";

/** Returns a google() model instance using the API key + model from DB or env */
export async function getAIModel(modelOverride?: string) {
  let apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  let modelId = modelOverride ?? DEFAULT_MODEL;

  try {
    const [keySetting, modelSetting] = await Promise.all([
      db.setting.findUnique({ where: { key: "gemini_api_key" } }),
      modelOverride ? null : db.setting.findUnique({ where: { key: "gemini_model" } }),
    ]);

    if (keySetting?.value?.trim()) {
      apiKey = keySetting.value.trim();
    }
    if (!modelOverride && modelSetting?.value?.trim()) {
      modelId = modelSetting.value.trim();
    }
  } catch {
    // If DB is unavailable, fall back to env/defaults
  }

  const google = createGoogleGenerativeAI({ apiKey });
  return google(modelId);
}
