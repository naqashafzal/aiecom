"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function processRedirectsXml(formData: FormData) {
  const file = formData.get("xmlFile") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const text = await file.text();
  
  // Extract URLs from XML (e.g. <loc>https://example.com/broken-link</loc>)
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  const urls = [];
  while ((match = locRegex.exec(text)) !== null) {
    urls.push(match[1]);
  }
  
  // Fallback: handle CSV or flat text file
  if (urls.length === 0) {
    // Split by newlines or commas, remove quotes
    const cells = text.split(/[\r\n,]+/).map(cell => cell.replace(/^["']|["']$/g, '').trim());
    const validUrls = cells.filter(l => l && (l.startsWith('http') || l.startsWith('/')));
    urls.push(...validUrls);
  }

  if (urls.length === 0) {
    throw new Error("No URLs found. Ensure it contains <loc> tags or valid URLs.");
  }

  // Get all products to try to find matches
  const products = await db.product.findMany({ select: { slug: true, name: true, id: true } });
  
  // Pre-fetch all existing redirects to avoid 9000+ individual DB queries
  const existingRedirects = await db.redirect.findMany({ select: { sourceUrl: true } });
  const existingSet = new Set(existingRedirects.map(r => r.sourceUrl));
  
  const newRedirectsData = [];

  for (const urlStr of urls) {
    try {
      // Handle both absolute and relative URLs
      const path = urlStr.startsWith('http') ? new URL(urlStr).pathname : urlStr;
      
      if (!path || path === "/") continue;
      if (existingSet.has(path)) continue;

      // Auto-match logic
      // Split path into words
      const words = path.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2 && w !== 'products' && w !== 'category');
      
      if (words.length === 0) continue;

      let bestMatch = null;
      let highestScore = 0;

      for (const p of products) {
        let score = 0;
        const targetString = `${p.name.toLowerCase()} ${p.slug.toLowerCase()}`;
        for (const w of words) {
          if (targetString.includes(w)) score++;
        }
        if (score > highestScore) {
          highestScore = score;
          bestMatch = p;
        }
      }

      if (bestMatch && highestScore > 0) {
        newRedirectsData.push({
          sourceUrl: path,
          destinationUrl: `/products/${bestMatch.slug}`,
          isAutomatic: true
        });
        // Add to set to avoid duplicates in the same file
        existingSet.add(path);
      }
    } catch (e) {
      // Ignore invalid URLs
    }
  }

  // Bulk insert in chunks of 1000 to handle 9000+ items safely and instantly
  let addedCount = 0;
  for (let i = 0; i < newRedirectsData.length; i += 1000) {
    const chunk = newRedirectsData.slice(i, i + 1000);
    const result = await db.redirect.createMany({
      data: chunk,
      skipDuplicates: true
    });
    addedCount += result.count;
  }

  revalidatePath("/admin/redirects");
  return { success: true, count: addedCount, total: urls.length };
}

export async function deleteRedirect(id: string) {
  await db.redirect.delete({ where: { id } });
  revalidatePath("/admin/redirects");
}

export async function createManualRedirect(formData: FormData) {
  const sourceUrl = formData.get("sourceUrl") as string;
  const destinationUrl = formData.get("destinationUrl") as string;

  if (!sourceUrl || !destinationUrl) {
    throw new Error("Missing fields");
  }

  const cleanSource = sourceUrl.startsWith('http') ? new URL(sourceUrl).pathname : (sourceUrl.startsWith('/') ? sourceUrl : `/${sourceUrl}`);
  const cleanDest = destinationUrl.startsWith('http') ? new URL(destinationUrl).pathname : (destinationUrl.startsWith('/') ? destinationUrl : `/${destinationUrl}`);

  await db.redirect.upsert({
    where: { sourceUrl: cleanSource },
    update: { destinationUrl: cleanDest, isAutomatic: false },
    create: { sourceUrl: cleanSource, destinationUrl: cleanDest, isAutomatic: false }
  });

  revalidatePath("/admin/redirects");
}
