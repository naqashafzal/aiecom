import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    // Dynamically determine the base URL (e.g. https://www.zsdecor.pk)
    // In production, you might want to hardcode this or use an env variable if request.headers.get('host') is unreliable
    const host = request.headers.get("host") || "www.zsdecor.pk";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

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
      const imageUrl = product.images[0]?.url 
        ? (product.images[0].url.startsWith('http') ? product.images[0].url : `${baseUrl}${product.images[0].url}`)
        : `${baseUrl}/placeholder.png`;
      
      const price = product.price.toFixed(2);
      const salePrice = product.salePrice ? product.salePrice.toFixed(2) : null;
      
      // Google requires specific availability formats
      const availability = product.stock > 0 ? "in_stock" : "out_of_stock";
      const condition = "new"; // Assuming all products are new
      
      // Google requires brand, if not available we use the store name
      const brand = product.brand?.name || "ZS Decor";

      // Ensure the description is plain text and escaped properly (strip HTML tags first if necessary)
      const plainDescription = product.description.replace(/<[^>]+>/g, ' ').substring(0, 5000); // Max 5000 chars

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
