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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        images: true
      }
    });

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404, headers: corsHeaders });

    const currencySetting = await db.setting.findUnique({ where: { key: "storeCurrency" } });
    const storeCurrency = currencySetting?.value || "USD";

    return NextResponse.json({ product, storeCurrency }, { headers: corsHeaders });
  } catch (error) {
    console.error("Mobile product GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, price, stock, status } = body;

    const product = await db.product.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock, 10) : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    return NextResponse.json({ success: true, product }, { headers: corsHeaders });
  } catch (error) {
    console.error("Mobile product PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
