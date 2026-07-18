const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { email: true, expoPushToken: true } });
  console.log(admins);
}

main().catch(console.error).finally(() => prisma.$disconnect());
