import { db } from "@/lib/prisma";
import PageForm from "../PageForm";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let page = null;
  if ((db as any).page) {
    page = await (db as any).page.findUnique({
      where: { id }
    });
  } else {
    const pages = await db.$queryRaw`SELECT * FROM Page WHERE id = ${id} LIMIT 1`;
    page = (pages as any)[0] || null;
  }

  if (!page) {
    notFound();
  }

  return <PageForm initialData={page} />;
}
