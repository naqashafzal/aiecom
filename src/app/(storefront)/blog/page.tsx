import { db } from "@/lib/prisma"
import Link from "next/link"
import { ArrowRight, Calendar, User } from "lucide-react"

export const metadata = {
  title: "Blog | Aura Ecommerce",
  description: "Read the latest news, tips, and updates from Aura.",
}

export default async function BlogIndexPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          The <span className="text-primary">Aura</span> Blog
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Discover tips, stories, and insights from our community of vendors and shoppers.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">No articles have been published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="group relative flex flex-col items-start bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300">
              {post.coverImage ? (
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 border-b flex items-center justify-center">
                  <span className="text-primary/40 font-bold text-4xl">Aura</span>
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col w-full">
                <div className="flex items-center gap-x-4 text-xs text-gray-500 mb-4">
                  <time dateTime={new Date(post.createdAt).toISOString()} className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author.name || post.author.email?.split('@')[0] || 'Admin'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-3">
                  <Link href={`/blog/${post.slug}`}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </h3>
                
                <p className="text-gray-500 line-clamp-3 text-sm flex-1">
                  {post.excerpt || post.content.substring(0, 150) + "..."}
                </p>

                <div className="mt-6 flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Read article <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
