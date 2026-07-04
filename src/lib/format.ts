import { db } from "@/lib/prisma";

export async function getStoreCurrency() {
  try {
    const currencySetting = await db.setting.findUnique({ where: { key: "storeCurrency" } });
    return currencySetting?.value || "USD";
  } catch (e) {
    return "USD";
  }
}

export async function getFormatPrice() {
  const currencyCode = await getStoreCurrency();
  
  return function formatPrice(price: number) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(price);
    } catch (e) {
      return `$${price.toFixed(2)}`;
    }
  };
}
