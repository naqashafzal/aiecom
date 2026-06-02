import { auth } from "@/auth"
import { db } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"

export default async function NewPostPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  async function createPost(formData: FormData) {
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

    await db.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        published,
        authorId: session.user.id
      }
    })

    revalidatePath("/admin/posts")
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create New Post</h1>
          <p className="text-sm text-gray-500">Write a new article for your blog.</p>
        </div>
      </div>

      <form action={createPost} className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-900">Title</label>
            <input 
              type="text" 
              id="title"
              name="title" 
              required
              placeholder="e.g. 10 Tips for E-commerce Success"
              className="w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium text-gray-900">URL Slug</label>
            <input 
              type="text" 
              id="slug"
              name="slug" 
              required
              placeholder="e.g. 10-tips-for-ecommerce-success"
              className="w-full h-10 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="excerpt" className="text-sm font-medium text-gray-900">Excerpt (Short Summary)</label>
          <textarea 
            id="excerpt"
            name="excerpt" 
            rows={2}
            placeholder="A brief summary of the article..."
            className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-gray-900">Content</label>
          <textarea 
            id="content"
            name="content" 
            required
            rows={12}
            placeholder="Write your blog post content here (Markdown or HTML)..."
            className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-black/5 font-mono text-sm resize-y"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input 
            type="checkbox" 
            id="published" 
            name="published" 
            className="rounded border-gray-300 text-black focus:ring-black h-4 w-4"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-900">
            Publish immediately
          </label>
        </div>

        <div className="pt-4 border-t flex justify-end gap-3">
          <Link href="/admin/posts">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" className="bg-[#1a1a1a] hover:bg-black text-white">
            Save Post
          </Button>
        </div>
      </form>
    </div>
  )
}
