"use server";

import { db } from "@/lib/prisma";

export async function getOrderStatus(orderNumber: number, phone: string) {
  try {
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        shippingAddress: true,
        items: {
          include: {
            product: true,
            variant: true,
          }
        }
      }
    });

    if (!order) {
      return { success: false, error: "Order not found. Please check your order number." };
    }

    // Security check: ensure the provided phone matches the shipping address phone
    // We strip non-numeric characters for comparison just in case
    const storedPhone = order.shippingAddress.phone.replace(/\D/g, "");
    const inputPhone = phone.replace(/\D/g, "");

    if (storedPhone !== inputPhone) {
      return { success: false, error: "Order not found or phone number does not match." };
    }

    return { 
      success: true, 
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingMethod: order.shippingMethod,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt.toISOString(),
        grandTotal: order.grandTotal,
        items: order.items.map(i => ({
          name: i.product.name,
          variant: i.variant?.name,
          quantity: i.quantity,
          price: i.price,
          image: i.product.images?.[0]?.url || null, // Assuming images relation exists or fetched if needed
        }))
      } 
    };
  } catch (error) {
    console.error("Failed to fetch order status:", error);
    return { success: false, error: "An error occurred while tracking the order." };
  }
}
