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
    // In a real application, extract user context from the authorization token
    // For this prototype, we'll fetch aggregated store data

    const [totalOrders, totalProducts, recentOrders] = await Promise.all([
      db.order.count(),
      db.product.count(),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { totalAmount: true, createdAt: true, status: true }
      })
    ]);

    const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return NextResponse.json({
      analytics: {
        totalOrders,
        totalProducts,
        totalRevenue: totalRevenue * 10, // Simulated total revenue
        recentRevenue: totalRevenue,
      }
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Mobile analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
