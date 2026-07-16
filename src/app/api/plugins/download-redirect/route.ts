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

    // Find a random published product
    const count = await db.product.count({
      where: { status: "ACTIVE" }
    });

    if (count === 0) {
      return NextResponse.json({ error: "No products found" }, { status: 404 });
    }

    const randomSkip = Math.floor(Math.random() * count);
    const randomProduct = await db.product.findFirst({
      where: { status: "ACTIVE" },
      skip: randomSkip,
      select: { slug: true }
    });

    if (!randomProduct) {
      return NextResponse.json({ error: "Failed to fetch random product" }, { status: 500 });
    }

    // Redirect to the random product with the query parameters
    const redirectUrl = new URL(`/products/${randomProduct.slug}`, request.url);
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
