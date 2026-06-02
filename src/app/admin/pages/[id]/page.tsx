import { db } from "@/lib/prisma";
import PageForm from "../PageForm";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: { id: string } }) {
  let page = null;
  if ((db as any).page) {
    page = await (db as any).page.findUnique({
      where: { id: params.id }
    });
  } else {
    const pages = await db.$queryRaw`SELECT * FROM Page WHERE id = ${params.id} LIMIT 1`;
    page = (pages as any)[0] || null;
  }

  if (!page) {
    notFound();
  }

  return <PageForm initialData={page} />;
}
