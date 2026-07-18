"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bulkUpdateOrderStatus(orderIds: string[], status: any) {
  try {
    await db.order.updateMany({
      where: {
        id: {
          in: orderIds
        }
      },
      data: {
        status: status
      }
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk update order status:", error);
    return { success: false, error: "Failed to update orders" };
  }
}

export async function bulkUpdatePaymentStatus(orderIds: string[], paymentStatus: string) {
  try {
    await db.order.updateMany({
      where: {
        id: {
          in: orderIds
        }
      },
      data: {
        paymentStatus: paymentStatus
      }
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to bulk update payment status:", error);
    return { success: false, error: "Failed to update payments" };
  }
}
