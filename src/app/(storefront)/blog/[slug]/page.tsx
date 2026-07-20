import { db } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PluginSlot } from "@/components/plugins/PluginSlot"
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug, published: true }
  })
  
  if (!post) return { title: "Post Not Found" }
  
  return {
    title: `${post.title} | Aura Blog`,
    description: post.excerpt || post.content.substring(0, 160),
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug, published: true },
    include: { author: true }
  })

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/blog">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to blog
          </Button>
        </Link>
      </div>

      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="font-medium text-gray-900">
              {post.author.name || post.author.email?.split('@')[0] || 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <time dateTime={new Date(post.createdAt).toISOString()}>
              {new Date(post.createdAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </time>
          </div>
        </div>
      </header>

      {post.coverImage && (
        <div className="mb-12 w-full rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full object-cover max-h-[500px]"
          />
        </div>
      )}

      <div className="prose prose-lg sm:prose-xl prose-primary mx-auto text-gray-700">
        {/* Simple rendering for now. For a real app, use next-mdx-remote or marked */}
        {(() => {
          const paragraphs = post.content.split('\n');
          const middleIndex = Math.floor(paragraphs.length / 2);

          return paragraphs.map((paragraph, index) => {
            let contentNode = null;
            if (!paragraph.trim()) contentNode = <br key={index} />;
            else if (paragraph.startsWith('# ')) contentNode = <h1 key={`h1-${index}`} className="text-3xl font-bold mt-8 mb-4 text-gray-900">{paragraph.replace('# ', '')}</h1>;
            else if (paragraph.startsWith('## ')) contentNode = <h2 key={`h2-${index}`} className="text-2xl font-bold mt-8 mb-4 text-gray-900">{paragraph.replace('## ', '')}</h2>;
            else if (paragraph.startsWith('### ')) contentNode = <h3 key={`h3-${index}`} className="text-xl font-bold mt-6 mb-3 text-gray-900">{paragraph.replace('### ', '')}</h3>;
            // Handling the new img tag logic from our RichTextEditor
            else if (paragraph.startsWith('<img') || paragraph.includes('<img')) {
              // Very basic HTML parsing for the specific img tag we generate
              contentNode = <div key={`img-${index}`} dangerouslySetInnerHTML={{ __html: paragraph }} />;
            } else {
              contentNode = <p key={`p-${index}`} className="mb-4 leading-relaxed">{paragraph}</p>;
            }

            if (index === middleIndex) {
              return (
                <div key={`wrapper-${index}`}>
                  {contentNode}
                  <div className="my-10">
                    <PluginSlot name="blog_post_middle" />
                  </div>
                </div>
              );
            }
            return contentNode;
          });
        })()}
      </div>

      <div className="mt-20 pt-8 border-t">
        <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl">
          <div>
            <h3 className="font-bold text-gray-900">Enjoyed this article?</h3>
            <p className="text-sm text-gray-500 mt-1">Check out more on our blog or explore our store.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/blog">
              <Button variant="outline">More Articles</Button>
            </Link>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">Shop Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
