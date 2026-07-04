"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createShippingZone(name: string, countries: string[]) {
  try {
    const zone = await db.shippingZone.create({
      data: {
        name,
        countries: JSON.stringify(countries),
        isActive: true,
      }
    });
    revalidatePath("/admin/settings/shipping");
    return { success: true, zone };
  } catch (error: any) {
    console.error("Failed to create shipping zone", error);
    return { success: false, error: error.message };
  }
}

export async function deleteShippingZone(id: string) {
  try {
    await db.shippingZone.delete({ where: { id } });
    revalidatePath("/admin/settings/shipping");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete shipping zone", error);
    return { success: false, error: error.message };
  }
}

export async function createShippingRate(
  zoneId: string, 
  name: string, 
  price: number, 
  condition: string, 
  minCondition: number | null, 
  maxCondition: number | null
) {
  try {
    const rate = await db.shippingRate.create({
      data: {
        zoneId,
        name,
        price,
        condition,
        minCondition,
        maxCondition,
        isActive: true
      }
    });
    revalidatePath("/admin/settings/shipping");
    return { success: true, rate };
  } catch (error: any) {
    console.error("Failed to create shipping rate", error);
    return { success: false, error: error.message };
  }
}

export async function deleteShippingRate(id: string) {
  try {
    await db.shippingRate.delete({ where: { id } });
    revalidatePath("/admin/settings/shipping");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete shipping rate", error);
    return { success: false, error: error.message };
  }
}
