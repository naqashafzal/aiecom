require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const zones = await prisma.shippingZone.findMany({ include: { rates: true } });
  for (const zone of zones) {
    let countries = [];
    try {
      countries = typeof zone.countries === 'string' ? JSON.parse(zone.countries) : (Array.isArray(zone.countries) ? zone.countries : []);
    } catch (e) {}
    console.log("Zone ID:", zone.id);
    console.log("Original countries type:", typeof zone.countries);
    console.log("Original countries val:", zone.countries);
    console.log("Parsed countries:", countries);
    console.log("Includes PK?", countries.includes("PK"));
  }
}
main().finally(() => prisma.$disconnect());
