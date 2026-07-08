import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Fetch 4 active products to use as upsells.
    // In a real scenario, you could use searchParams to exclude currently carted items,
    // or use a recommendation engine based on tags. Here we grab the newest/featured ones.
    const products = await db.product.findMany({
      where: {
        status: 'ACTIVE',
      },
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        images: true,
      }
    });

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error("Upsell API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
