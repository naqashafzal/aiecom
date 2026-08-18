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
        brand: true,
        categories: true,
        variants: true
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
      
      const condition = "new";
      
      // Google requires brand, if not available we use the store name
      const brand = product.brand?.name || "ZS Decor";

      // Map categories
      const productType = product.categories?.length > 0 
        ? product.categories.map(c => c.name).join(" > ") 
        : "";

      // Safely handle descriptions (some might be null or undefined due to legacy data)
      const rawDescription = product.description || product.name || "";
      const plainDescription = rawDescription.replace(/<[^>]+>/g, ' ').substring(0, 5000); 

      const generateItemXml = (
        id: string, 
        title: string, 
        price: number, 
        salePrice: number | null, 
        stock: number,
        itemGroupId?: string
      ) => {
        const formattedPrice = price.toFixed(2);
        const formattedSalePrice = salePrice ? salePrice.toFixed(2) : null;
        const availability = stock > 0 ? "in_stock" : "out_of_stock";
        
        let itemXml = `    <item>
      <g:id>${id}</g:id>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${plainDescription}]]></description>
      <link>${escapeXml(productUrl)}</link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${formattedPrice} PKR</g:price>
      ${formattedSalePrice ? `<g:sale_price>${formattedSalePrice} PKR</g:sale_price>` : ''}
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
`;
        if (productType) {
          itemXml += `      <g:product_type><![CDATA[${productType}]]></g:product_type>\n`;
        }
        if (itemGroupId) {
          itemXml += `      <g:item_group_id>${itemGroupId}</g:item_group_id>\n`;
        }
        itemXml += `    </item>\n`;
        return itemXml;
      };

      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          const variantTitle = `${product.name} - ${variant.name}`;
          const vPrice = variant.price !== null ? variant.price : product.price;
          const vSalePrice = variant.price !== null ? null : product.salePrice;
          xml += generateItemXml(variant.id, variantTitle, vPrice, vSalePrice, variant.stock, product.id);
        }
      } else {
        xml += generateItemXml(product.id, product.name, product.price, product.salePrice, product.stock);
      }
    }

    xml += `  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
      }
    });

  } catch (error) {
    console.error("Failed to generate Google Merchant feed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
