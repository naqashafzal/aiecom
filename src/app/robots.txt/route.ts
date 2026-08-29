import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zsdecor-ecom.vercel.app";
  
  let robotsTxt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /cart\n\nSitemap: ${baseUrl}/sitemap.xml`;

  try {
    const customRobots = await db.setting.findUnique({ where: { key: "seo_robots_txt" } });
    if (customRobots?.value) {
      robotsTxt = `${customRobots.value}\n\nSitemap: ${baseUrl}/sitemap.xml`;
    }
  } catch (e) {
    console.error("Failed to fetch custom robots.txt", e);
  }

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
