import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "@/lib/prisma";

export const mcpServer = new McpServer({
  name: "ZSDecor-Storefront",
  version: "1.0.0"
});

// We need a place to store active transports mapping sessionId -> transport
// In Next.js, API routes are bundled separately, so we MUST use the global object
// to share this Map between /api/mcp/index.ts and /api/mcp/messages.ts
const globalAny = global as any;
if (!globalAny.mcpActiveTransports) {
  globalAny.mcpActiveTransports = new Map<string, any>();
}
export const activeTransports = globalAny.mcpActiveTransports;

// Helper for formatting responses
const formatResponse = (data: any, isError = false) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  isError
});

// ==========================================
// STORE STATS & SETTINGS
// ==========================================
mcpServer.tool("getStoreStats", "Get total revenue, total orders, and total active products.", {}, async () => {
  const ordersCount = await db.order.count();
  const revenueObj = await db.order.aggregate({ _sum: { grandTotal: true }, where: { paymentStatus: 'PAID' } });
  const activeProducts = await db.product.count({ where: { status: 'ACTIVE' } });
  return formatResponse({ totalOrders: ordersCount, totalRevenue: revenueObj._sum.grandTotal || 0, activeProducts });
});

mcpServer.tool("updateSetting", "Update a global store setting", {
  key: z.string().describe("Setting key to update"),
  value: z.string().describe("New value as string")
}, async ({ key, value }) => {
  const setting = await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
  return formatResponse({ success: true, setting });
});

// ==========================================
// ORDERS
// ==========================================
mcpServer.tool("getRecentOrders", "Get the most recent orders", {
  limit: z.number().optional().describe("Number of orders to retrieve (default 5)")
}, async ({ limit = 5 }) => {
  const orders = await db.order.findMany({ take: limit, orderBy: { createdAt: 'desc' }, include: { shippingAddress: true } });
  const formatted = orders.map(o => ({
    id: o.id, orderNumber: o.orderNumber, status: o.status, paymentStatus: o.paymentStatus, total: o.grandTotal, date: o.createdAt, customerName: o.shippingAddress?.firstName + ' ' + o.shippingAddress?.lastName
  }));
  return formatResponse(formatted);
});

mcpServer.tool("getOrderDetails", "Get full details of a specific order", {
  orderId: z.string().describe("Order ID")
}, async ({ orderId }) => {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, shippingAddress: true, user: true }
  });
  if (!order) return formatResponse({ error: "Order not found" }, true);
  return formatResponse(order);
});

mcpServer.tool("updateOrderStatus", "Update the fulfillment or payment status of an order", {
  orderId: z.string().describe("Order ID"),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  paymentStatus: z.string().optional()
}, async ({ orderId, status, paymentStatus }) => {
  const data: any = {};
  if (status) data.status = status;
  if (paymentStatus) data.paymentStatus = paymentStatus;
  try {
    const updated = await db.order.update({ where: { id: orderId }, data });
    return formatResponse({ success: true, updated });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

// ==========================================
// PRODUCTS
// ==========================================
mcpServer.tool("searchProducts", "Search for products by name", {
  query: z.string().describe("Keyword to search for")
}, async ({ query }) => {
  const products = await db.product.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 10, select: { id: true, name: true, price: true, stock: true, status: true } });
  return formatResponse(products);
});

mcpServer.tool("updateProductStock", "Update inventory stock for a product", {
  productId: z.string().describe("Product ID"),
  newStock: z.number().describe("New stock quantity")
}, async ({ productId, newStock }) => {
  try {
    const updated = await db.product.update({ where: { id: productId }, data: { stock: newStock } });
    return formatResponse({ success: true, product: updated.name, newStock: updated.stock });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

mcpServer.tool("createProduct", "Create a new product", {
  name: z.string(), description: z.string(), price: z.number(), stock: z.number()
}, async ({ name, description, price, stock }) => {
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const product = await db.product.create({ data: { name, slug, description, price, stock } });
    return formatResponse({ success: true, product });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

mcpServer.tool("deleteProduct", "Delete a product", {
  productId: z.string()
}, async ({ productId }) => {
  try {
    await db.product.delete({ where: { id: productId } });
    return formatResponse({ success: true });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

// ==========================================
// CATEGORIES & BRANDS
// ==========================================
mcpServer.tool("getCategories", "List all categories", {}, async () => {
  const categories = await db.category.findMany({ select: { id: true, name: true, slug: true } });
  return formatResponse(categories);
});

mcpServer.tool("createCategory", "Create a category", {
  name: z.string()
}, async ({ name }) => {
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await db.category.create({ data: { name, slug } });
    return formatResponse({ success: true, category });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

mcpServer.tool("getBrands", "List all brands", {}, async () => {
  const brands = await db.brand.findMany({ select: { id: true, name: true } });
  return formatResponse(brands);
});

// ==========================================
// MARKETING & CONTENT
// ==========================================
mcpServer.tool("getBlogPosts", "List blog posts", {}, async () => {
  const posts = await db.post.findMany({ select: { id: true, title: true, published: true, createdAt: true } });
  return formatResponse(posts);
});

mcpServer.tool("createBlogPost", "Create a new blog post", {
  title: z.string(), content: z.string(), excerpt: z.string().optional(), published: z.boolean().default(false), authorId: z.string().describe("User ID of the author")
}, async ({ title, content, excerpt, published, authorId }) => {
  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const post = await db.post.create({ data: { title, slug, content, excerpt, published, authorId } });
    return formatResponse({ success: true, post });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

mcpServer.tool("getCoupons", "List discount coupons", {}, async () => {
  const coupons = await db.coupon.findMany({ select: { id: true, code: true, type: true, value: true, isActive: true } });
  return formatResponse(coupons);
});

mcpServer.tool("createCoupon", "Create a discount coupon", {
  code: z.string(), type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]), value: z.number(), usageLimit: z.number().optional()
}, async ({ code, type, value, usageLimit }) => {
  try {
    const coupon = await db.coupon.create({ data: { code, type, value, usageLimit } });
    return formatResponse({ success: true, coupon });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

// ==========================================
// CUSTOMERS & REVIEWS
// ==========================================
mcpServer.tool("getCustomers", "List registered customers", {
  limit: z.number().optional()
}, async ({ limit = 10 }) => {
  const users = await db.user.findMany({ take: limit, select: { id: true, name: true, email: true, createdAt: true } });
  return formatResponse(users);
});

mcpServer.tool("getReviews", "Get product reviews", {
  pendingOnly: z.boolean().optional().describe("Only fetch reviews pending approval")
}, async ({ pendingOnly }) => {
  const reviews = await db.review.findMany({
    where: pendingOnly ? { isApproved: false } : undefined,
    include: { product: { select: { name: true } }, user: { select: { name: true } } }
  });
  return formatResponse(reviews);
});

mcpServer.tool("approveReview", "Approve a customer review", {
  reviewId: z.string()
}, async ({ reviewId }) => {
  try {
    const review = await db.review.update({ where: { id: reviewId }, data: { isApproved: true } });
    return formatResponse({ success: true, review });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

mcpServer.tool("getContactMessages", "Read contact us messages", {
  unreadOnly: z.boolean().optional()
}, async ({ unreadOnly }) => {
  const msgs = await db.contactMessage.findMany({ where: unreadOnly ? { isRead: false } : undefined });
  return formatResponse(msgs);
});

mcpServer.tool("markContactMessageRead", "Mark contact message as read", {
  messageId: z.string()
}, async ({ messageId }) => {
  try {
    const msg = await db.contactMessage.update({ where: { id: messageId }, data: { isRead: true } });
    return formatResponse({ success: true, msg });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

// ==========================================
// VENDORS & STORES
// ==========================================
mcpServer.tool("getStores", "List multi-vendor stores", {}, async () => {
  const stores = await db.store.findMany({ select: { id: true, name: true, slug: true, rating: true } });
  return formatResponse(stores);
});

// ==========================================
// ADVANCED ADMIN & FAKE DATA GENERATION
// ==========================================
mcpServer.tool("generateFakeReviews", "Generate bulk fake reviews for products", {
  count: z.number().describe("Number of fake reviews to generate (1-100)")
}, async ({ count }) => {
  try {
    const products = await db.product.findMany({ select: { id: true } });
    let users = await db.user.findMany({ select: { id: true, name: true } });

    if (products.length === 0) return formatResponse({ error: "No products found to review" }, true);

    if (users.length === 0) {
      await db.user.createMany({
        data: Array.from({ length: 5 }).map((_, i) => ({
          name: `Fake User ${i + 1}`,
          email: `fake${Date.now()}_${i}@example.com`,
        }))
      });
      users = await db.user.findMany({ select: { id: true, name: true } });
    }

    const reviewTitles = ["Great product!", "Not bad", "Excellent quality", "Will buy again", "Disappointed"];
    const reviewComments = [
      "I really liked this product. It exceeded my expectations.",
      "It's okay, but could be better. The quality is decent.",
      "Absolutely fantastic! I highly recommend it.",
      "Very good value for the price. Happy with my purchase.",
      "Not what I expected. The description was misleading."
    ];

    const newReviews = Array.from({ length: Math.min(100, Math.max(1, count)) }).map(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const rating = Math.floor(Math.random() * 5) + 1;
      
      return {
        productId: randomProduct.id,
        userId: randomUser.id,
        rating,
        title: reviewTitles[Math.floor(Math.random() * reviewTitles.length)],
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        isApproved: Math.random() > 0.5
      };
    });

    await db.review.createMany({ data: newReviews });
    return formatResponse({ success: true, count: newReviews.length, message: `Successfully generated ${newReviews.length} fake reviews.` });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

mcpServer.tool("deleteReview", "Delete a customer review", {
  reviewId: z.string().describe("ID of the review to delete")
}, async ({ reviewId }) => {
  try {
    await db.review.delete({ where: { id: reviewId } });
    return formatResponse({ success: true, message: "Review deleted successfully." });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

mcpServer.tool("deleteOrder", "Permanently delete an order", {
  orderId: z.string().describe("ID of the order to delete")
}, async ({ orderId }) => {
  try {
    await db.order.delete({ where: { id: orderId } });
    return formatResponse({ success: true, message: "Order deleted successfully." });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

mcpServer.tool("createCustomer", "Create a fake customer account manually", {
  name: z.string().describe("Name of the customer"),
  email: z.string().describe("Email of the customer"),
  role: z.enum(["USER", "ADMIN"]).optional().describe("Role of the user")
}, async ({ name, email, role = "USER" }) => {
  try {
    const user = await db.user.create({
      data: { name, email, role }
    });
    return formatResponse({ success: true, user });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

mcpServer.tool("deleteCustomer", "Permanently delete a customer", {
  userId: z.string().describe("ID of the user to delete")
}, async ({ userId }) => {
  try {
    await db.user.delete({ where: { id: userId } });
    return formatResponse({ success: true, message: "Customer deleted successfully." });
  } catch (e: any) {
    return formatResponse({ error: e.message }, true);
  }
});

