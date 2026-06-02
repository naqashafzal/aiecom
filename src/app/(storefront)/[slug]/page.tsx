import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CustomPage({ params }: { params: { slug: string } }) {
  let page: any = null;
  if ((db as any).page) {
    page = await (db as any).page.findUnique({
      where: { slug: params.slug }
    });
  } else {
    const pages = await db.$queryRaw`SELECT * FROM Page WHERE slug = ${params.slug} LIMIT 1`;
    page = (pages as any)[0] || null;
  }

  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 pb-4 border-b">{page.title}</h1>
        
        {/* Render HTML content safely */}
        <div 
          className="prose prose-lg max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>
    </div>
  );
}
