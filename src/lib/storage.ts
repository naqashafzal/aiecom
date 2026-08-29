import { db } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

/**
 * Universally handles file uploads for the application.
 * Depending on the admin settings, it will upload to Cloudinary or fallback to the local filesystem.
 * @param file The File object from FormData
 * @param type "image" or "video" (Cloudinary needs to know for resource_type)
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(file: File, type: "image" | "video" = "image"): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("File is empty or invalid");
  }

  // 1. Fetch storage settings from DB
  let provider = "local";
  let cloudinaryUrl = process.env.CLOUDINARY_URL;

  try {
    const [providerSetting, urlSetting] = await Promise.all([
      db.setting.findUnique({ where: { key: "storage_provider" } }),
      db.setting.findUnique({ where: { key: "cloudinary_url" } })
    ]);
    
    if (providerSetting?.value) provider = providerSetting.value;
    if (urlSetting?.value) cloudinaryUrl = urlSetting.value;
  } catch (e) {
    console.error("Failed to fetch storage settings, defaulting to local", e);
  }

  const bytes = await file.arrayBuffer();

  // 2. Cloudinary Upload
  if (provider === "cloudinary" && cloudinaryUrl) {
    // We configure Cloudinary globally or per request
    try {
      const urlObj = new URL(cloudinaryUrl);
      cloudinary.config({
        cloud_name: urlObj.hostname,
        api_key: urlObj.username,
        api_secret: urlObj.password,
        secure: true
      });
    } catch (e) {
      console.error("Invalid Cloudinary URL format", e);
      throw new Error("Invalid Cloudinary URL in settings");
    }

    // Cloudinary accepts Base64 Data URIs directly
    const buffer = Buffer.from(bytes);
    const mime = file.type || (type === "video" ? "video/mp4" : "image/jpeg");
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: type === "video" ? "video" : "image",
        folder: "aiecom", // Organized folder in Cloudinary
      });
      return result.secure_url;
    } catch (error: any) {
      console.error("Cloudinary upload failed:", error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // 3. Local Storage Fallback
  // Ensure the name is safe
  const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : (type === "video" ? "video.mp4" : "image.jpg");
  const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}-${safeName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDir, fileName), new Uint8Array(bytes));
  
  // Return the relative URL which will be served by Next.js or our custom /uploads route
  return `/uploads/${fileName}`;
}
