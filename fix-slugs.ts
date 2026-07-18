import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const products = await db.product.findMany();
  let updatedCount = 0;

  for (const p of products) {
    const slug = p.slug;
    // Check if slug ends with -[a-z0-9]{6}
    const match = slug.match(/(.+)-[a-z0-9]{6}$/);
    if (match) {
      const baseSlug = match[1];
      console.log(`Fixing product slug: ${slug} -> ${baseSlug}`);
      
      // We must ensure the new slug is unique
      let newSlug = baseSlug;
      let counter = 1;
      let isUnique = false;
      while (!isUnique) {
        const existing = await db.product.findUnique({ where: { slug: newSlug } });
        if (!existing || existing.id === p.id) {
          isUnique = true;
        } else {
          newSlug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      await db.product.update({
        where: { id: p.id },
        data: { slug: newSlug }
      });
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} products.`);

  const categories = await db.category.findMany();
  let updatedCatCount = 0;

  for (const c of categories) {
    const slug = c.slug;
    const match = slug.match(/(.+)-[a-z0-9]{6}$/);
    if (match) {
      const baseSlug = match[1];
      console.log(`Fixing category slug: ${slug} -> ${baseSlug}`);
      
      let newSlug = baseSlug;
      let counter = 1;
      let isUnique = false;
      while (!isUnique) {
        const existing = await db.category.findUnique({ where: { slug: newSlug } });
        if (!existing || existing.id === c.id) {
          isUnique = true;
        } else {
          newSlug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      await db.category.update({
        where: { id: c.id },
        data: { slug: newSlug }
      });
      updatedCatCount++;
    }
  }

  console.log(`Updated ${updatedCatCount} categories.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
