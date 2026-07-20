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
        {(() => {
          // Normalize newlines to \n and split by double (or more) newlines
          const normalizedContent = post.content.replace(/\r\n/g, '\n');
          const rawBlocks = normalizedContent.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
          
          const toc: { id: string; text: string; level: number }[] = [];
          
          const parsedBlocks = rawBlocks.map((block) => {
            const mdHeaderMatch = block.match(/^(#{2,3})\s+(.*)/);
            if (mdHeaderMatch) {
              const level = mdHeaderMatch[1].length;
              const text = mdHeaderMatch[2].replace(/<[^>]+>/g, '');
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              toc.push({ id, text, level });
              return { type: 'header', level, id, html: mdHeaderMatch[2], original: block };
            }
            
            const htmlHeaderMatch = block.match(/^<(h[23])[^>]*>(.*?)<\/\1>/i);
            if (htmlHeaderMatch) {
              const level = parseInt(htmlHeaderMatch[1][1]);
              const rawText = htmlHeaderMatch[2];
              const text = rawText.replace(/<[^>]+>/g, '');
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              toc.push({ id, text, level });
              return { type: 'html_header', level, id, html: rawText, original: block };
            }
            
            if (block.trim().match(/^<(div|ul|ol|li|img|blockquote|p|table|iframe|b|i|strong|em|a|h1|h4|h5|h6)/i)) {
              return { type: 'html', html: block, original: block };
            }
            
            const htmlBlock = block.replace(/\n/g, '<br/>');
            return { type: 'text', html: htmlBlock, original: block };
          });

          const middleIndex = Math.floor(parsedBlocks.length / 2);

          return (
            <>
              {toc.length > 0 && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-10 text-gray-900 shadow-sm not-prose">
                  <h4 className="font-bold mb-4 text-lg">Table of Contents</h4>
                  <ul className="space-y-3">
                    {toc.map((item, idx) => (
                      <li key={idx} className={item.level === 3 ? "ml-6" : ""}>
                        <a href={`#${item.id}`} className="text-primary hover:underline hover:text-primary/80 transition-colors flex items-start gap-2">
                          <span className="text-primary/40 mt-1 text-xs">▼</span>
                          <span>{item.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {parsedBlocks.map((block, index) => {
                let contentNode = null;
                
                if (block.type === 'header' || block.type === 'html_header') {
                  const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
                  // Let Tailwind typography (prose) handle margins and fonts, only add scroll-mt for anchor links
                  contentNode = <Tag key={`h-${index}`} id={block.id} className="scroll-mt-24" dangerouslySetInnerHTML={{ __html: block.html }} />;
                } else if (block.type === 'html') {
                  contentNode = <div key={`html-${index}`} dangerouslySetInnerHTML={{ __html: block.html }} />;
                } else {
                  contentNode = <p key={`text-${index}`} dangerouslySetInnerHTML={{ __html: block.html }} />;
                }

                if (index === middleIndex) {
                  return (
                    <div key={`wrapper-${index}`}>
                      {contentNode}
                      <div className="my-10 not-prose">
                        <PluginSlot name="blog_post_middle" />
                      </div>
                    </div>
                  );
                }

                return contentNode;
              })}
            </>
          );
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
