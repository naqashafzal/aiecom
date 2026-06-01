const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');

async function main() {
  const pool = mariadb.createPool("mysql://root@localhost:3306/aura_db");

  const adapter = new PrismaMariaDb(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findFirst();
    console.log("DB test success, user found:", user);
  } catch (e) {
    console.error("DB test error:", e);
  } finally {
    process.exit(0);
  }
}

main();
