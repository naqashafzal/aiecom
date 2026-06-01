const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'mysql://root:@localhost:3306/aura_db'
      }
    }
  });

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
