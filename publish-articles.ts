import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const articlesDir = path.join(__dirname, 'content', 'articles');
  if (!fs.existsSync(articlesDir)) {
    console.error("Articles directory not found at:", articlesDir);
    process.exit(1);
  }

  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));
  
  // Find an admin user to assign these posts to
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.error("No ADMIN user found in the database. Please create an admin first.");
    process.exit(1);
  }

  console.log(`Found ${files.length} articles to publish. Author assigned: ${admin.name || admin.email}`);

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Parse the custom markdown format
    const seoTitleMatch = content.match(/# SEO Title\n(.*?)\n/);
    const metaDescMatch = content.match(/# Meta Description\n(.*?)\n/);
    const slugMatch = content.match(/# URL Slug\n(.*?)\n/);
    
    // Extract the article body (everything after '---' and '# Article')
    const articleSplit = content.split('---');
    let articleBody = articleSplit.length > 1 ? articleSplit[1].trim() : content;
    
    // Remove the `# Article` header if present
    articleBody = articleBody.replace(/^# Article\n/, '').trim();

    const title = seoTitleMatch ? seoTitleMatch[1].trim() : file.replace('.md', '');
    const excerpt = metaDescMatch ? metaDescMatch[1].trim() : '';
    const slug = slugMatch ? slugMatch[1].trim() : title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if post already exists
    const existing = await prisma.post.findUnique({
      where: { slug }
    });

    if (existing) {
      console.log(`Skipping: "${title}" (Slug already exists)`);
      continue;
    }

    try {
      await prisma.post.create({
        data: {
          title,
          slug,
          excerpt,
          content: articleBody,
          published: true, // Publish immediately
          authorId: admin.id,
        }
      });
      console.log(`✅ Successfully published: "${title}"`);
    } catch (e: any) {
      console.error(`❌ Failed to publish: "${title}" - Error: ${e.message}`);
    }
  }

  console.log("Finished publishing all articles!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
