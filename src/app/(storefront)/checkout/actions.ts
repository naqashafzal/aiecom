"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
export async function getPaymentSettings() {
  const settingsRecords = await db.setting.findMany({
    where: {
      key: {
        in: [
          "payment_cod_enabled",
          "payment_bank_enabled",
          "payment_bank_name",
          "payment_bank_title",
          "payment_bank_iban",
          "payment_easypaisa_enabled",
          "payment_easypaisa_title",
          "payment_easypaisa_number",
          "payment_jazzcash_enabled",
          "payment_jazzcash_title",
          "payment_jazzcash_number"
        ]
      }
    }
  });

  const settings: Record<string, string> = {};
  settingsRecords.forEach(s => settings[s.key] = s.value);

  // Provide sensible defaults if not configured
  return {
    codEnabled: settings.payment_cod_enabled !== "false", // default true
    bankEnabled: settings.payment_bank_enabled === "true",
    bankName: settings.payment_bank_name || "",
    bankTitle: settings.payment_bank_title || "",
    bankIban: settings.payment_bank_iban || "",
    easypaisaEnabled: settings.payment_easypaisa_enabled === "true",
    easypaisaTitle: settings.payment_easypaisa_title || "",
    easypaisaNumber: settings.payment_easypaisa_number || "",
    jazzcashEnabled: settings.payment_jazzcash_enabled === "true",
    jazzcashTitle: settings.payment_jazzcash_title || "",
    jazzcashNumber: settings.payment_jazzcash_number || "",
  };
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
  transactionId?: string;
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
        paymentStatus: data.paymentMethod === "Cash on Delivery" ? "PENDING" : "VERIFICATION_REQUIRED",
        status: "PROCESSING",
        shippingAddressId: address.id,
      }
    });

    if (data.transactionId && data.paymentMethod !== "Cash on Delivery") {
      await db.payment.create({
        data: {
          orderId: order.id,
          transactionId: data.transactionId,
          amount: data.totals.grandTotal,
          status: "PENDING_VERIFICATION",
          method: data.paymentMethod,
        }
      });
    }

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
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/products");
    
    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("Checkout failed:", error);
    return { success: false, error: "Failed to process checkout" };
  }
}
