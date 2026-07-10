import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import * as React from 'react';

// Make sure to add RESEND_API_KEY to your .env file
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_do_not_use');

export async function sendOrderConfirmationEmail(orderData: {
  email: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  currencyCode: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY is not set in environment variables. Email will not actually be sent.");
      console.log("Mock sending email to:", orderData.email);
      return { success: true, message: "Mock email sent (API key missing)" };
    }

    const { data, error } = await resend.emails.send({
      from: 'Aura Store <onboarding@resend.dev>', // Update this when you verify a domain on Resend
      to: [orderData.email],
      subject: `Order Confirmation #${orderData.orderNumber}`,
      react: React.createElement(OrderConfirmationEmail, {
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName,
        items: orderData.items,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        currencyCode: orderData.currencyCode,
      }),
    });

    if (error) {
      console.error("Error sending email via Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return { success: false, error };
  }
}
