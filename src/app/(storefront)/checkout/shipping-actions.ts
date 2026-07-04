"use server";

import { db } from "@/lib/prisma";

export async function getApplicableShippingRates(countryCode: string, cartTotal: number) {
  try {
    // Find all active zones
    const allZones = await db.shippingZone.findMany({
      where: { isActive: true },
      include: {
        rates: {
          where: { isActive: true }
        }
      }
    });

    let matchedZone = null;

    // 1. Try to find a zone that explicitly includes this country
    for (const zone of allZones) {
      const countries = JSON.parse(zone.countries as string);
      if (countries.includes(countryCode.toUpperCase())) {
        matchedZone = zone;
        break;
      }
    }

    // 2. Fallback to a "Rest of World" zone if configured (e.g. wildcard "*")
    if (!matchedZone) {
      for (const zone of allZones) {
        const countries = JSON.parse(zone.countries as string);
        if (countries.includes("*")) {
          matchedZone = zone;
          break;
        }
      }
    }

    if (!matchedZone) {
      return { success: false, error: "No shipping zone available for this country." };
    }

    // Filter rates based on conditions (like cart Total)
    const applicableRates = matchedZone.rates.filter((rate: any) => {
      if (rate.condition === "NONE") return true;
      if (rate.condition === "PRICE") {
        if (rate.minCondition !== null && cartTotal < rate.minCondition) return false;
        if (rate.maxCondition !== null && cartTotal > rate.maxCondition) return false;
        return true;
      }
      return true; // fallback
    });

    return { success: true, rates: applicableRates };

  } catch (error: any) {
    console.error("Failed to fetch shipping rates:", error);
    return { success: false, error: "Internal server error" };
  }
}
