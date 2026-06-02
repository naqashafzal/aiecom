"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateFooterSettings(formData: FormData) {
  const keys = [
    "footer_store_name",
    "footer_tagline",
    "footer_copyright",
    "footer_col1_title",
    "footer_col1_links",
    "footer_col2_title",
    "footer_col2_links",
    "footer_col3_title",
    "footer_col3_links",
    "footer_newsletter_title",
    "footer_newsletter_text",
    "footer_social_facebook",
    "footer_social_instagram",
    "footer_social_twitter",
    "footer_social_youtube",
    "footer_show_newsletter",
    "footer_bg_color",
    "footer_text_color",
  ];

  for (const key of keys) {
    const value = formData.get(key) as string | null;
    if (value !== null) {
      await db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/footer");
}
