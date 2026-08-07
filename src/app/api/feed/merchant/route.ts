import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // Allow up to 5 minutes on Vercel/Next.js
export const dynamic = "force-dynamic";

function escapeXml(unsafe: string) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: NextRequest) {
  try {
    // Force the correct base URL to prevent internal Docker/Nginx hostnames from breaking the feed links
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.zsdecor.pk";
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    // Fetch all active products with their primary image
    const products = await db.product.findMany({
      where: {
        status: "ACTIVE"
      },
      include: {
        images: {
          take: 1
        },
        brand: true
      }
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>ZS Decor</title>
    <link>${baseUrl}</link>
    <description>Product feed for ZS Decor</description>
`;

    for (const product of products) {
      const productUrl = `${baseUrl}/products/${product.slug}`;
      const imageUrl = product.images?.[0]?.url 
        ? (product.images[0].url.startsWith('http') ? product.images[0].url : `${baseUrl}${product.images[0].url}`)
        : `${baseUrl}/placeholder.png`;
      
      const price = product.price.toFixed(2);
      const salePrice = product.salePrice ? product.salePrice.toFixed(2) : null;
      
      // Google requires specific availability formats
      const availability = product.stock > 0 ? "in_stock" : "out_of_stock";
      const condition = "new";
      
      // Google requires brand, if not available we use the store name
      const brand = product.brand?.name || "ZS Decor";

      // Safely handle descriptions (some might be null or undefined due to legacy data)
      const rawDescription = product.description || product.name || "";
      const plainDescription = rawDescription.replace(/<[^>]+>/g, ' ').substring(0, 5000); 

      xml += `    <item>
      <g:id>${product.id}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(plainDescription)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price} PKR</g:price>
      ${salePrice ? `<g:sale_price>${salePrice} PKR</g:sale_price>` : ''}
      <g:brand>${escapeXml(brand)}</g:brand>
    </item>
`;
    }

    xml += `  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });

  } catch (error) {
    console.error("Failed to generate Google Merchant feed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
