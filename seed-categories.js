const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  const prisma = new PrismaClient();

  try {
    const categories = [
      { name: "Electronics", slug: "electronics", description: "Gadgets and tech" },
      { name: "Clothing", slug: "clothing", description: "Apparel and fashion" },
      { name: "Home & Garden", slug: "home-garden", description: "Furniture and decor" },
      { name: "Accessories", slug: "accessories", description: "Watches, bags, and more" },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }

    console.log("✅ Categories seeded successfully!");
  } catch (e) {
    console.error("Seed error:", e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
