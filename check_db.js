require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.shippingZone.findMany({ include: { rates: true } })
  .then(s => console.log(JSON.stringify(s, null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
