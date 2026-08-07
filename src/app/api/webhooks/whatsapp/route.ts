import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { formatPhoneNumber, sendWhatsAppMessage } from '@/lib/whatsapp';
import { getCachedSettings } from '@/lib/cache';

// GET is used for Meta Webhook Verification
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const settings = await getCachedSettings();
  const verifyToken = settings.whatsapp_webhook_verify_token || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp Webhook Verified!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// POST is used to receive incoming WhatsApp messages from customers
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if this is a WhatsApp message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const fromNumber = message.from; // Customer's phone number
        const msgText = message.text?.body?.toUpperCase().trim(); // E.g., "YES", "NO"

        if (msgText === 'YES' || msgText === 'NO') {
          // Find the most recent pending order for this phone number
          const recentOrder = await db.order.findFirst({
            where: {
              shippingAddress: {
                phone: {
                  endsWith: fromNumber.length > 10 ? fromNumber.substring(fromNumber.length - 10) : fromNumber
                }
              },
              status: { in: ['PENDING', 'PROCESSING'] }
            },
            orderBy: { createdAt: 'desc' },
            include: { shippingAddress: true }
          });

          if (recentOrder) {
            if (msgText === 'YES') {
              // Confirm the order
              await db.order.update({
                where: { id: recentOrder.id },
                data: { status: 'CONFIRMED' }
              });
              
              // Send Confirmation Reply
              await sendWhatsAppMessage(
                fromNumber, 
                `✅ Awesome! Your order #${recentOrder.orderNumber} for Rs. ${recentOrder.grandTotal} is now CONFIRMED and will be shipped soon. Thank you for shopping with ZS Decor!`
              );
            } else if (msgText === 'NO') {
              // Cancel the order
              await db.order.update({
                where: { id: recentOrder.id },
                data: { status: 'CANCELLED' }
              });
              
              // Send Cancellation Reply
              await sendWhatsAppMessage(
                fromNumber, 
                `🚫 Your order #${recentOrder.orderNumber} has been successfully CANCELLED. If you change your mind, visit our website to order again.`
              );
            }
          } else {
            // No pending order found
            await sendWhatsAppMessage(
              fromNumber,
              `We couldn't find any pending orders associated with this number. If you need help, please contact our support.`
            );
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
