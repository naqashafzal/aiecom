import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const downloadUrl = searchParams.get("downloadUrl");
    const duration = searchParams.get("duration");

    if (!downloadUrl) {
      return NextResponse.json({ error: "Missing downloadUrl parameter" }, { status: 400 });
    }

    // Find a random published blog post
    const count = await db.post.count({
      where: { published: true }
    });

    if (count === 0) {
      return NextResponse.json({ error: "No blog posts found" }, { status: 404 });
    }

    const randomSkip = Math.floor(Math.random() * count);
    const randomPost = await db.post.findFirst({
      where: { published: true },
      skip: randomSkip,
      select: { slug: true }
    });

    if (!randomPost) {
      return NextResponse.json({ error: "Failed to fetch random blog post" }, { status: 500 });
    }

    // Construct base URL respecting reverse proxies
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    // Redirect to the random blog post with the query parameters
    const redirectUrl = new URL(`/blog/${randomPost.slug}`, baseUrl);
    redirectUrl.searchParams.set("downloadUrl", downloadUrl);
    if (duration) {
      redirectUrl.searchParams.set("duration", duration);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in download-redirect route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
