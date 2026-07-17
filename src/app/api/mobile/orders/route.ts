import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // In a real app, verify the Bearer token from headers here.
    // const authHeader = req.headers.get("authorization");
    
    // Fetch latest 20 orders
    const orders = await db.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Mobile orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
