import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const fileName = `theme-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${file.name.split('.').pop()}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Use Uint8Array to avoid Node Buffer quirks in edge/docker
    fs.writeFileSync(path.join(uploadDir, fileName), new Uint8Array(bytes));

    const imageUrl = `/uploads/${fileName}`;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (err: any) {
    console.error("Theme Upload Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
