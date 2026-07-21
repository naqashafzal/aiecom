import { db } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PluginSlot } from "@/components/plugins/PluginSlot"
import { AdSlot } from "@/components/ads/AdSlot"
import { autoLinkify } from "@/lib/linkify"
import { marked } from "marked"
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug }
  })
  
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: post.coverImage ? [post.coverImage] : []
    }
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

  // Fetch AdSense Settings
  let adClientId = "ca-pub-placeholder";
  let adSlotId = "1234567890";
  try {
    const settings = await db.setting.findMany({
      where: { key: { in: ["ad_sense_client_id", "ad_sense_slot_id"] } }
    });
    const clientSetting = settings.find(s => s.key === "ad_sense_client_id");
    const slotSetting = settings.find(s => s.key === "ad_sense_slot_id");
    if (clientSetting?.value) adClientId = clientSetting.value;
    if (slotSetting?.value) adSlotId = slotSetting.value;
  } catch (e) {
    console.error("Failed to fetch ad settings", e);
  }

  // Fetch active AutoLinks
  const autoLinks = await db.autoLink.findMany({
    where: { isActive: true },
  });

  return (
    <article className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      <div className="prose prose-lg sm:prose-xl prose-primary mx-auto w-full text-gray-700">
        {(() => {
          // Parse Markdown to HTML first
          const rawHtmlContent = marked.parse(post.content || "") as string;
          
          // Apply Auto Links to the fully rendered HTML
          const linkifiedHtml = autoLinkify(rawHtmlContent, autoLinks);

          // Split by paragraphs or double newlines to insert ads
          // Since marked wraps paragraphs in <p>, we can split by </p>
          const rawBlocks = linkifiedHtml.split('</p>').map(b => b.trim() ? b + '</p>' : '').filter(Boolean);
          
          const toc: { id: string; text: string; level: number }[] = [];
          
          const parsedBlocks = rawBlocks.map((block) => {
            const htmlHeaderMatch = block.match(/^<(h[1-6])[^>]*>(.*?)<\/\1>/i);
            if (htmlHeaderMatch) {
              const level = parseInt(htmlHeaderMatch[1][1]);
              const rawText = htmlHeaderMatch[2];
              const text = rawText.replace(/<[^>]+>/g, '');
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              toc.push({ id, text, level });
              
              // Inject ID into the header for TOC linking
              const blockWithId = block.replace(/^<(h[1-6])/, `<$1 id="${id}" className="scroll-mt-24"`);
              return { type: 'html_header', level, id, html: blockWithId, original: block };
            }
            
            return { type: 'html', html: block, original: block };
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
                const contentNode = <div key={`html-${index}`} dangerouslySetInnerHTML={{ __html: block.html }} />;

                const showAd = index > 0 && index % 4 === 0 && Math.abs(index - middleIndex) > 1;

                if (index === middleIndex || showAd) {
                  return (
                    <div key={`wrapper-${index}`}>
                      {contentNode}
                      {index === middleIndex && (
                        <div className="my-10 not-prose">
                          <PluginSlot name="blog_post_middle" />
                        </div>
                      )}
                      {showAd && (
                        <div className="my-8 not-prose flex flex-col items-center border-y border-gray-100 py-6">
                          <AdSlot client={adClientId} slot={adSlotId} className="w-full mx-auto min-h-[250px]" />
                        </div>
                      )}
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
