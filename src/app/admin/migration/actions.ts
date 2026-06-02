"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

const SHOPIFY_API_VERSION = "2026-04";

type ShopifyApiError = {
  message?: string;
};

type ShopifyTokenResponse = {
  access_token?: string;
  scope?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type ShopifyProductEdge = {
  node: {
    title: string;
    handle?: string | null;
    descriptionHtml?: string | null;
    variants?: {
      edges?: Array<{
        node?: {
          price?: string | number | null;
          inventoryItem?: {
            inventoryLevels?: {
              edges?: Array<{
                node?: {
                  quantities?: Array<{
                    name: string;
                    quantity: number;
                  }>;
                };
              }>;
            };
          };
        };
      }>;
    };
    media?: {
      edges?: ShopifyMediaEdge[];
    };
    collections?: {
      edges?: Array<{
        node?: {
          title?: string | null;
          handle?: string | null;
        };
      }>;
    };
  };
};

type ShopifyMediaEdge = {
  node?: {
    mediaContentType?: string | null;
    image?: {
      url?: string | null;
    } | null;
  };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeShopifyStoreDomain(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.includes("admin.shopify.com/store/")) {
    const match = trimmed.match(/admin\.shopify\.com\/store\/([^/?#]+)/i);
    const storeHandle = match?.[1]?.trim();
    return storeHandle ? `${storeHandle}.myshopify.com` : "";
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host.endsWith(".myshopify.com")) return host;
  if (host === "myshopify.com") return "";

  const storeName = host.split(".")[0];
  return storeName ? `${storeName}.myshopify.com` : "";
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function shopifyErrorMessage(json: unknown) {
  const errors = typeof json === "object" && json !== null && "errors" in json
    ? (json as { errors?: ShopifyApiError[] | string }).errors
    : undefined;

  if (!errors) return null;
  if (Array.isArray(errors)) {
    return errors
      .map((error) => error?.message || JSON.stringify(error))
      .filter(Boolean)
      .join("; ");
  }
  return typeof errors === "string" ? errors : JSON.stringify(errors);
}

async function getShopifyAccessToken(storeUrl: string, formData: FormData) {
  const accessToken = ((formData.get("accessToken") as string) || "").trim();
  if (accessToken) return accessToken;

  const clientId = ((formData.get("clientId") as string) || "").trim();
  const clientSecret = ((formData.get("clientSecret") as string) || "").trim();

  if (!clientId || !clientSecret) {
    throw new Error("Enter an Admin API access token, or enter both Client ID and Client Secret.");
  }

  const response = await fetch(`https://${storeUrl}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const json = await response.json().catch(() => null) as ShopifyTokenResponse | null;

  if (!response.ok || !json?.access_token) {
    const detail = json?.error_description || json?.error || response.statusText;
    throw new Error(`Could not get Shopify access token: ${detail}`);
  }

  if (json.scope) {
    const scopes = json.scope.split(",").map(scope => scope.trim());
    const hasProductsAccess = scopes.includes("read_products") || scopes.includes("write_products");
    const hasInventoryAccess = scopes.includes("read_inventory") || scopes.includes("write_inventory");
    
    if (!hasProductsAccess || !hasInventoryAccess) {
      throw new Error(`Shopify token was created, but the app is missing scopes. Required: read_products, read_inventory. Found: ${json.scope || 'none'}`);
    }
  }

  return json.access_token;
}

function parseCSV(str: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(cell);
      result.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    result.push(row);
  }

  return result.filter(r => r.length > 1 || r[0] !== "");
}

export async function analyzeCsv(formData: FormData) {
  try {
    const file = formData.get("csvFile") as File;
    if (!file || file.size === 0) throw new Error("No file uploaded.");

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      throw new Error("CSV file must contain a header row and at least one product.");
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const titleIdx = headers.findIndex(h => h.includes("title") || h.includes("name"));
    const tagsIdx = headers.findIndex(h => h === "tags");

    if (titleIdx === -1) throw new Error("Could not find a 'Title' or 'Name' column in the CSV.");

    let productCount = 0;
    const categories = new Set<string>();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < titleIdx) continue;

      const name = row[titleIdx];
      if (!name) continue;

      productCount++;

      const typeNames = tagsIdx !== -1 && row[tagsIdx]
        ? row[tagsIdx].split(',').map(s => s.trim()).filter(Boolean)
        : [];

      typeNames.forEach(name => categories.add(name));
    }

    return {
      success: true,
      productCount,
      categoryCount: categories.size
    };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to analyze the CSV file.") };
  }
}

export async function importProductsCsv(formData: FormData) {
  try {
    const file = formData.get("csvFile") as File;
    if (!file || file.size === 0) {
      throw new Error("No file uploaded.");
    }

    const platform = formData.get("platform") as string;
    const text = await file.text();

    const rows = parseCSV(text);
    if (rows.length < 2) {
      throw new Error("CSV file must contain a header row and at least one product.");
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());

    // Map platform specific column names
    const titleIdx = headers.findIndex(h => h.includes("title") || h.includes("name"));
    const descIdx = headers.findIndex(h => h.includes("body (html)") || h.includes("description"));
    const priceIdx = headers.findIndex(h => h.includes("variant price") || h.includes("regular price") || h === "price");
    const stockIdx = headers.findIndex(h => h.includes("variant inventory qty") || h.includes("stock"));
    const tagsIdx = headers.findIndex(h => h === "tags");
    const imgIdx = headers.findIndex(h => h.includes("image src") || h.includes("images") || h === "image");

    if (titleIdx === -1) throw new Error("Could not find a 'Title' or 'Name' column in the CSV.");

    let importedCount = 0;
    const defaultCategory = await db.category.findFirst() || await db.category.create({
      data: { name: "Imported", slug: "imported", description: "Imported products" }
    });

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < titleIdx) continue;

      const name = row[titleIdx];
      if (!name) continue;

      const description = descIdx !== -1 && row[descIdx] ? row[descIdx] : "Imported product from " + platform;
      const price = priceIdx !== -1 && row[priceIdx] ? parseFloat(row[priceIdx]) : 19.99;
      const stock = stockIdx !== -1 && row[stockIdx] ? parseInt(row[stockIdx]) : 10;

      const typeNames = tagsIdx !== -1 && row[tagsIdx]
        ? row[tagsIdx].split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const categoryIds: string[] = [];

      if (typeNames.length > 0) {
        for (const typeName of typeNames) {
          let existingCat = await db.category.findFirst({ where: { name: typeName } });
          if (!existingCat) {
            const catSlug = typeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            existingCat = await db.category.create({
              data: { name: typeName, slug: catSlug }
            });
          }
          categoryIds.push(existingCat.id);
        }
      } else {
        categoryIds.push(defaultCategory.id);
      }

      // Generate clean slug
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (await db.product.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Download Image
      let localImageUrl: string | null = null;
      if (imgIdx !== -1 && row[imgIdx] && row[imgIdx].startsWith('http')) {
        try {
          const imageUrl = row[imgIdx];
          const res = await fetch(imageUrl);
          if (res.ok) {
            const buffer = Buffer.from(await res.arrayBuffer());
            const urlPath = new URL(imageUrl).pathname;
            const urlExt = path.extname(urlPath) || '.jpg';
            const fileName = `mig-${Date.now()}-${Math.random().toString(36).substring(7)}${urlExt}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            fs.writeFileSync(path.join(uploadDir, fileName), buffer);
            localImageUrl = `/uploads/${fileName}`;
          }
        } catch (err) {
          console.error("Failed to download image:", err);
        }
      }

      await db.product.create({
        data: {
          name,
          slug,
          description,
          price: isNaN(price) ? 19.99 : price,
          stock: isNaN(stock) ? 10 : stock,
          status: "ACTIVE",
          categories: {
            connect: categoryIds.map(id => ({ id }))
          },
          ...(localImageUrl ? {
            images: {
              create: {
                url: localImageUrl,
                isPrimary: true
              }
            }
          } : {})
        }
      });
      importedCount++;
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      message: `Successfully processed CSV file from ${platform}.`,
      count: importedCount
    };

  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to process the CSV file.") };
  }
}

export async function deleteAllCatalog() {
  try {
    // Need to delete dependencies first if cascade is not set
    await db.productImage.deleteMany();
    await db.product.deleteMany();
    await db.category.deleteMany();

    // Clear uploads folder? Too risky if other things use it, but we can do DB at least.

    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, message: "Catalog has been completely reset." };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to reset catalog.") };
  }
}

export async function syncShopifyApi(formData: FormData) {
  try {
    const rawStoreUrl = formData.get("storeUrl") as string;

    if (!rawStoreUrl) {
      throw new Error("Store URL is required.");
    }

    const storeUrl = normalizeShopifyStoreDomain(rawStoreUrl);
    if (!storeUrl) {
      throw new Error("Enter a valid Shopify store URL, for example your-store.myshopify.com.");
    }

    const accessToken = await getShopifyAccessToken(storeUrl, formData);
    const endpoint = `https://${storeUrl}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

    const query = `
      query ProductsForImport($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              title
              handle
              descriptionHtml
              variants(first: 1) {
                edges {
                  node {
                    price
                    inventoryItem {
                      inventoryLevels(first: 10) {
                        edges {
                          node {
                            quantities(names: ["available"]) {
                              name
                              quantity
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              media(first: 5) {
                edges {
                  node {
                    mediaContentType
                    ... on MediaImage {
                      image {
                        url
                      }
                    }
                  }
                }
              }
              collections(first: 5) {
                edges {
                  node {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
    `;

    const products: ShopifyProductEdge[] = [];
    let after: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query, variables: { first: 50, after } }),
      });

      const json = await response.json().catch(() => null) as {
        data?: {
          products?: {
            edges?: ShopifyProductEdge[];
            pageInfo?: {
              hasNextPage?: boolean;
              endCursor?: string | null;
            };
          };
        };
        errors?: ShopifyApiError[] | string;
      } | null;

      if (!response.ok) {
        throw new Error(`Shopify API error (${response.status}): ${shopifyErrorMessage(json) || response.statusText}`);
      }

      const apiError = shopifyErrorMessage(json);
      if (apiError) {
        throw new Error(apiError);
      }

      products.push(...(json?.data?.products?.edges || []));
      hasNextPage = Boolean(json?.data?.products?.pageInfo?.hasNextPage);
      after = json?.data?.products?.pageInfo?.endCursor || null;
    }

    if (products.length === 0) {
      return { success: true, message: "No products found in the store.", count: 0 };
    }

    let importedCount = 0;
    const defaultCategory = await db.category.findFirst() || await db.category.create({
      data: { name: "Imported", slug: "imported", description: "Imported via API" }
    });

    for (const edge of products) {
      const p = edge.node;

      const priceStr = p.variants?.edges?.[0]?.node?.price || "19.99";
      const price = Number(priceStr);
      let stock = 10;
      const inventoryLevels = p.variants?.edges?.[0]?.node?.inventoryItem?.inventoryLevels?.edges;
      if (inventoryLevels && inventoryLevels.length > 0) {
        stock = inventoryLevels.reduce((acc, levelEdge) => {
          const availableQuantity = levelEdge.node?.quantities?.find(q => q.name === "available")?.quantity || 0;
          return acc + availableQuantity;
        }, 0);
      }

      const collections = p.collections?.edges || [];
      const categoryIds: string[] = [];

      if (collections.length > 0) {
        for (const colEdge of collections) {
          const colName = colEdge.node?.title;
          if (!colName) continue;
          let existingCat = await db.category.findFirst({ where: { name: colName } });
          if (!existingCat) {
            existingCat = await db.category.create({
              data: { name: colName, slug: colEdge.node?.handle || slugify(colName) }
            });
          }
          categoryIds.push(existingCat.id);
        }
      } else {
        categoryIds.push(defaultCategory.id);
      }

      let slug = p.handle;
      if (!slug) {
        slug = slugify(p.title);
      }
      let counter = 1;
      while (await db.product.findUnique({ where: { slug } })) {
        slug = `${p.handle || slugify(p.title)}-${counter}`;
        counter++;
      }

      // Download primary image (for now just one to keep it fast, but can be expanded)
      let localImageUrl: string | null = null;
      const imageUrl = p.media?.edges?.find((edge) => edge.node?.mediaContentType === "IMAGE")?.node?.image?.url;

      if (imageUrl) {
        try {
          const res = await fetch(imageUrl);
          if (res.ok) {
            const buffer = Buffer.from(await res.arrayBuffer());
            const urlPath = new URL(imageUrl).pathname;
            const urlExt = path.extname(urlPath) || '.jpg';
            const fileName = `api-${Date.now()}-${Math.random().toString(36).substring(7)}${urlExt}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            fs.writeFileSync(path.join(uploadDir, fileName), buffer);
            localImageUrl = `/uploads/${fileName}`;
          }
        } catch (err) {
          console.error("Failed to download Shopify API image:", err);
        }
      }

      await db.product.create({
        data: {
          name: p.title,
          slug,
          description: p.descriptionHtml || "Imported product",
          price: isNaN(price) ? 19.99 : price,
          stock: isNaN(stock) ? (p.totalInventory ?? 10) : stock,
          status: "ACTIVE",
          categories: {
            connect: categoryIds.map(id => ({ id }))
          },
          ...(localImageUrl ? {
            images: {
              create: {
                url: localImageUrl,
                isPrimary: true
              }
            }
          } : {})
        }
      });
      importedCount++;
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      message: "Successfully synchronized with Shopify Admin API.",
      count: importedCount
    };

  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to sync via API.") };
  }
}
