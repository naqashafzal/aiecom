import { NextResponse } from 'next/server';
import { createProduct } from '@/app/admin/actions';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    await createProduct(formData);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ success: false, error: err.message, stack: err.stack }, { status: 500 });
  }
}
