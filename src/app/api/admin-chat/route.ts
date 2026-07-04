import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/prisma';
import { auth } from '@/auth';

export const maxDuration = 30;

export async function POST(req: Request) {
  // Add authentication check for admin route
  const session = await auth();
  const user = session?.user?.email ? await db.user.findUnique({ where: { email: session.user.email } }) : null;
  
  if (!user || user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: `You are the Omni-Agent for the Aura E-Commerce Admin Dashboard.
You have absolute knowledge and control over the store's data via your tools.
Be helpful, concise, and professional. 
If asked to modify data (like stock or order status), confirm the action you took.
If you don't know the answer or a tool fails, admit it gracefully.`,
    messages,
    tools: {
      getStoreStats: tool({
        description: 'Get the total revenue, total order count, and total active products in the store.',
        parameters: z.object({}),
        execute: async () => {
          const ordersCount = await db.order.count();
          const revenueObj = await db.order.aggregate({
            _sum: { grandTotal: true },
            where: { paymentStatus: 'PAID' }
          });
          const activeProducts = await db.product.count({
            where: { status: 'ACTIVE' }
          });
          return {
            totalOrders: ordersCount,
            totalRevenue: revenueObj._sum.grandTotal || 0,
            activeProducts
          };
        }
      }),
      getRecentOrders: tool({
        description: 'Get the most recent orders.',
        parameters: z.object({
          limit: z.number().optional().describe('Number of orders to retrieve (default 5)')
        }),
        execute: async ({ limit = 5 }) => {
          const orders = await db.order.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { shippingAddress: true, user: true }
          });
          return orders.map(o => ({
            id: o.id,
            status: o.status,
            paymentStatus: o.paymentStatus,
            total: o.grandTotal,
            date: o.createdAt,
            customerName: o.shippingAddress?.firstName + ' ' + o.shippingAddress?.lastName
          }));
        }
      }),
      searchProducts: tool({
        description: 'Search for products by name to check stock, price, or ID.',
        parameters: z.object({
          query: z.string().describe('The product name or keyword to search for')
        }),
        execute: async ({ query }) => {
          const products = await db.product.findMany({
            where: { name: { contains: query } },
            take: 5
          });
          return products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            status: p.status
          }));
        }
      }),
      updateProductStock: tool({
        description: 'Update the inventory stock for a specific product ID.',
        parameters: z.object({
          productId: z.string().describe('The ID of the product'),
          newStock: z.number().describe('The new stock quantity')
        }),
        execute: async ({ productId, newStock }) => {
          const updated = await db.product.update({
            where: { id: productId },
            data: { stock: newStock }
          });
          return { success: true, product: updated.name, newStock: updated.stock };
        }
      }),
      updateOrderStatus: tool({
        description: 'Update the fulfillment status of an order by ID.',
        parameters: z.object({
          orderId: z.string().describe('The ID of the order'),
          status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).describe('The new status')
        }),
        execute: async ({ orderId, status }) => {
          const updated = await db.order.update({
            where: { id: orderId },
            data: { status }
          });
          return { success: true, orderId: updated.id, newStatus: updated.status };
        }
      }),
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
