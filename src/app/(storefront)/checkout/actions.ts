"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

// Initialize Stripe with a fallback test key if env is not set
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_4eC39HqLyjWDarjtT1zdp7dc', {
  apiVersion: "2024-06-20" as any,
});

export async function createPaymentIntent(amount: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: paymentIntent.client_secret };
  } catch (error: any) {
    console.error("Stripe error:", error);
    return { error: error.message || "Failed to create payment intent" };
  }
}

export async function processCheckout(data: {
  items: any[];
  shipping: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    grandTotal: number;
  };
  paymentMethod: string;
  shippingMethod?: string;
}) {
  try {
    // 1. Create Address
    const address = await db.address.create({
      data: {
        firstName: data.shipping.firstName,
        lastName: data.shipping.lastName,
        address1: data.shipping.address1,
        address2: data.shipping.address2 || null,
        city: data.shipping.city,
        state: data.shipping.state || "N/A",
        zipCode: data.shipping.postalCode,
        country: data.shipping.country,
        phone: data.shipping.phone,
      }
    });

    // 2. Create Order
    const order = await db.order.create({
      data: {
        totalAmount: data.totals.subtotal,
        shippingAmount: data.totals.shipping,
        taxAmount: data.totals.tax,
        grandTotal: data.totals.grandTotal,
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod,
        paymentStatus: data.paymentMethod === "Manual" ? "PENDING" : "PAID",
        status: "PROCESSING",
        shippingAddressId: address.id,
      }
    });

    // 3. Create Order Items & Update Stock
    for (const item of data.items) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        }
      });

      // Decrement stock
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/products");
    
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Checkout failed:", error);
    return { success: false, error: "Failed to process checkout" };
  }
}
