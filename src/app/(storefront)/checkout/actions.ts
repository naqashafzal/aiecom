"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
        postalCode: data.shipping.postalCode,
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
        paymentMethod: "Credit Card (Mocked)",
        paymentStatus: "PAID",
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
