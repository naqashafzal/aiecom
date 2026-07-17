import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const currencySetting = await db.setting.findUnique({ where: { key: "storeCurrency" } });
    const storeCurrency = currencySetting?.value || "USD";

    const products = await db.product.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        status: true,
        images: true
      }
    });

    return NextResponse.json({ products, storeCurrency }, { headers: corsHeaders });
  } catch (error) {
    console.error("Mobile products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, stock, status } = body;

    const product = await db.product.create({
      data: {
        name: name || "New Product",
        slug: name ? name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() : `new-product-${Date.now()}`,
        description: "",
        price: price ? parseFloat(price) : 0,
        stock: stock ? parseInt(stock, 10) : 0,
        status: status || "DRAFT"
      }
    });

    return NextResponse.json({ success: true, product }, { headers: corsHeaders });
  } catch (error) {
    console.error("Mobile product POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
