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

export async function POST(req: Request) {
  try {
    const { email, pushToken } = await req.json();

    if (!email || !pushToken) {
      return NextResponse.json({ error: "Missing email or push token" }, { status: 400, headers: corsHeaders });
    }

    // Save the token to the admin user
    const user = await db.user.update({
      where: { email },
      data: { expoPushToken: pushToken }
    });

    return NextResponse.json({ success: true, user: { email: user.email } }, { headers: corsHeaders });

  } catch (error) {
    console.error("Mobile notification register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
