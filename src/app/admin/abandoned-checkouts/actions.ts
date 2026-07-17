"use server";

import { db } from "@/lib/prisma";
import { resend } from "@/lib/email";
import { getFormatPrice } from "@/lib/format";
import { revalidatePath } from "next/cache";

export async function sendAbandonedCartEmail(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { 
            product: {
              include: { images: true }
            } 
          }
        }
      }
    });

    if (!order || !order.email) {
      throw new Error("Order not found or no email provided");
    }

    const settings = await db.setting.findMany();
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    const storeName = settingsMap["store_name"] || "ZS Decor Official Store";
    const fromEmail = settingsMap["email_from_address"] || "onboarding@resend.dev";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const formatPrice = await getFormatPrice();

    const items = order.items.map(item => ({
      name: item.product?.name || "Product",
      image: item.product?.images?.[0]?.url 
        ? (item.product.images[0].url.startsWith('http') ? item.product.images[0].url : `${appUrl}${item.product.images[0].url}`)
        : `${appUrl}/placeholder.png`,
      price: formatPrice(item.price * item.quantity)
    }));

    const checkoutUrl = `${appUrl}/cart`;
    const cartTotalStr = formatPrice(order.totalAmount);
    const customerName = order.email.split('@')[0];

    // Build the items list HTML
    const itemsListHtml = items.map(i => `
      <div style="display:flex; align-items:center; margin-bottom:10px;">
        <img src="${i.image}" width="50" height="50" style="margin-right:10px; border-radius:4px;" />
        <div>
          <strong>${i.name}</strong><br/>
          ${i.price}
        </div>
      </div>
    `).join("");

    // Fetch custom templates or use defaults
    const defaultSubject = "Did you forget something at {{storeName}}?";
    const defaultBody = `<h1>Did you forget something?</h1>\n<p>Hi {{customerName}},</p>\n<p>We noticed you left some great items in your cart at {{storeName}}. Don't worry, we've saved them for you!</p>\n<hr/>\n<p><strong>Your Items:</strong><br/>{{itemsList}}</p>\n<p><strong>Total:</strong> {{cartTotal}}</p>\n<br/><br/>\n<a href="{{checkoutUrl}}" style="background: black; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Your Purchase</a>`;

    let subject = settingsMap["email_abandoned_subject"] || defaultSubject;
    let body = settingsMap["email_abandoned_body"] || defaultBody;

    // Parser function
    const parseTemplate = (str: string) => {
      return str
        .replace(/\{\{customerName\}\}/g, customerName)
        .replace(/\{\{storeName\}\}/g, storeName)
        .replace(/\{\{checkoutUrl\}\}/g, checkoutUrl)
        .replace(/\{\{cartTotal\}\}/g, cartTotalStr)
        .replace(/\{\{itemsList\}\}/g, itemsListHtml);
    };

    const finalSubject = parseTemplate(subject);
    const finalHtml = parseTemplate(body);

    await resend.emails.send({
      from: `${storeName} <${fromEmail}>`,
      to: order.email,
      subject: finalSubject,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">${finalHtml}</div>`,
    });

    console.log(`Abandoned cart email sent to ${order.email}`);

    revalidatePath("/admin/abandoned-checkouts");
    return { success: true };
  } catch (error) {
    console.error("Failed to send abandoned cart email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
