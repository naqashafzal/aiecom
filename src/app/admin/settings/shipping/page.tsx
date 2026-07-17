import { db } from "@/lib/prisma";
import ShippingClient from "./ShippingClient";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const zones = await db.shippingZone.findMany({
    include: {
      rates: true
    },
    orderBy: { createdAt: "asc" }
  });

  const currencySetting = await db.setting.findUnique({ where: { key: "store_currency" } });
  const currencyCode = currencySetting?.value || "USD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shipping & Delivery</h1>
        <p className="text-sm text-gray-500">Configure where you ship and how much you charge.</p>
      </div>
      
      <ShippingClient initialZones={zones} currencyCode={currencyCode} />
    </div>
  );
}
