const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  const prisma = new PrismaClient(); // Native Rust engine, reading from env

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
