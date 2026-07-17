const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.setting.findMany();
  console.log(settings);
}

main().catch(console.error).finally(() => prisma.$disconnect());
