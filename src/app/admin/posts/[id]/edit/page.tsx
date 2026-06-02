import { auth } from "@/auth"
import { db } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const post = await db.post.findUnique({
    where: { id: params.id }
  })

  if (!post) {
    notFound()
  }

  async function updatePost(formData: FormData) {
    "use server"
    
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const published = formData.get("published") === "on"

    if (!title || !slug || !content) {
      throw new Error("Missing required fields")
    }

    await db.post.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        content,
        excerpt,
        published,
      }
    })

    revalidatePath("/admin/posts")
    revalidatePath(`/blog/${slug}`)
    revalidatePath("/blog")
    redirect("/admin/posts")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/posts">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Post</h1>
          <p className="text-sm text-gray-500">Update your blog article.</p>
        </div>
      </div>

      <form action={updatePost} className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-900">Title</label>
            <input 
              type="text" 
              id="title"
              name="title" 
              defaultValue={post.title}
              required
              className="w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-gray-900">URL Slug</label>
            <input 
              type="text" 
              id="slug"
              name="slug" 
              defaultValue={post.slug}
              required
              className="w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="excerpt" className="text-sm font-medium text-gray-900">Excerpt (Short Summary)</label>
          <textarea 
            id="excerpt"
            name="excerpt" 
            defaultValue={post.excerpt || ""}
            rows={2}
            className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-gray-900">Content</label>
          <textarea 
            id="content"
            name="content" 
            defaultValue={post.content}
            required
            rows={12}
            className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5 font-mono text-sm resize-y"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input 
            type="checkbox" 
            id="published" 
            name="published" 
            defaultChecked={post.published}
            className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-900">
            Published
          </label>
        </div>

        <div className="pt-4 border-t flex justify-end gap-3">
          <Link href="/admin/posts">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-[#1a1a1a] hover:bg-black text-white">
            Update Post
          </Button>
        </div>
      </form>
    </div>
  )
}
