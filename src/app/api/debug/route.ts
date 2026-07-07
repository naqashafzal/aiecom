import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file");

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const files = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : [];
    
    if (fileName) {
      const filePath = path.join(uploadDir, fileName);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const preview = fs.readFileSync(filePath, { encoding: "utf8" }).substring(0, 100);
        return NextResponse.json({
          status: "Found",
          size: stats.size,
          preview: preview, // To see if it's HTML or binary
          path: filePath
        });
      } else {
        return NextResponse.json({
          status: "Not Found",
          searchedPath: filePath,
          allFiles: files
        });
      }
    }

    return NextResponse.json({
      cwd: process.cwd(),
      uploadDir,
      filesCount: files.length,
      files: files.slice(0, 50)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack });
  }
}
