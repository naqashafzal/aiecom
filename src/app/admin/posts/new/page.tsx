import { auth } from "@/auth"
import { db } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { NewPostForm } from "./NewPostForm"

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
    const coverImage = formData.get("coverImage") as string
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
        coverImage,
        published,
        authorId: session.user.id
      }
    })

    revalidatePath("/admin/posts")
    redirect("/admin/posts")
  }

  const aiSetting = await db.setting.findUnique({ where: { key: "aiMarketingAgent" } })
  const aiEnabled = aiSetting?.value === "true"

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

      <NewPostForm createPostAction={createPost} aiEnabled={aiEnabled} />
    </div>
  )
}
