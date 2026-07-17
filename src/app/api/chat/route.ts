// @ts-nocheck
import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/prisma';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const rawSettings = await db.setting.findMany();
  const settings = rawSettings.reduce((acc: Record<string, string>, s: any) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

  const agentName = settings.aiAgentName || "ZS Decor";
  const defaultPrompt = `You are ${agentName}, the premier AI Sales Assistant for the ZS Decor Ecommerce platform.
Your job is to help customers find products, answer questions, and assist with their shopping experience.
- Be concise, friendly, and highly professional.
- ALWAYS try to recommend actual products that are available in the store using your tools.
- Do NOT make up products. If the search tool returns empty, apologize and suggest something else.
- Format prices properly with a dollar sign ($).`;

  const systemPrompt = settings.aiAgentPrompt || defaultPrompt;

  const result = streamText({
    model: google('gemini-1.5-flash'),
    messages,
    system: systemPrompt,
    tools: {
      searchProducts: tool({
        description: 'Search for products in the store by name, description, or category. Use this to find specific items the user asks for.',
        parameters: z.object({
          query: z.string().describe('The search term to look for, e.g. "laptop" or "camping".'),
        }),
        execute: async ({ query }: { query: string }) => {
          const products = await db.product.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } }
              ]
            },
            take: 5,
            select: { id: true, name: true, price: true, slug: true }
          });
          return products;
        },
      }),
      getFeaturedProducts: tool({
        description: 'Get a list of featured or popular products to recommend to the user if they do not know what they want.',
        parameters: z.object({}),
        execute: async () => {
          const products = await db.product.findMany({
            where: { isFeatured: true },
            take: 3,
            select: { id: true, name: true, price: true, slug: true }
          });
          return products;
        },
      }),
      prepareCartAddition: tool({
        description: 'Prepare a product to be added to the customer\'s shopping cart. Call this when the user says they want to buy an item or add it to their cart.',
        parameters: z.object({
          productId: z.string().describe('The ID of the product to add to the cart.'),
          quantity: z.number().default(1).describe('The number of items to add.'),
        }),
        execute: async ({ productId, quantity }: { productId: string, quantity: number }) => {
          const product = await db.product.findUnique({
            where: { id: productId },
            include: { images: true }
          });
          
          if (!product) return { success: false, error: 'Product not found' };
          
          return { 
            success: true, 
            item: {
              id: product.id,
              productId: product.id,
              name: product.name,
              price: product.salePrice || product.price,
              image: product.images[0]?.url || 'https://via.placeholder.com/150',
              quantity
            } 
          };
        }
      })
    },
  });

  return result.toTextStreamResponse();
}
