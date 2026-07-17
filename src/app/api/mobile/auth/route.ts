import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // In a real app, generate a JWT here using `jsonwebtoken` or `jose`
    // For this demonstration, we return a simple mock token and user data
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Mobile auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
