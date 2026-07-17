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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: { name: true, images: true }
            }
          }
        }
      }
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404, headers: corsHeaders });

    const currencySetting = await db.setting.findUnique({ where: { key: "storeCurrency" } });
    const storeCurrency = currencySetting?.value || "USD";

    return NextResponse.json({ order, storeCurrency }, { headers: corsHeaders });
  } catch (error) {
    console.error("Mobile order GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const order = await db.order.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, order }, { headers: corsHeaders });
  } catch (error) {
    console.error("Mobile order PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
