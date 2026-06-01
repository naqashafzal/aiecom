const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');

async function main() {
  const pool = mariadb.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'aura_db',
    connectionLimit: 15,
  });

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
