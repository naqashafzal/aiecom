const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const images = await prisma.productImage.findMany({ take: 5 });
  console.log("Images:", images);
  
  const products = await prisma.product.count();
  console.log("Total Products:", products);
}

main().catch(console.error).finally(() => prisma.$disconnect());
