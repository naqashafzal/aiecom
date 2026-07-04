import { db } from "@/lib/prisma";
import { MoreToLoveClient } from "@/app/(storefront)/MoreToLoveClient";

export async function MoreToLoveSection({ settings, storeCurrency = "USD" }: { settings: Record<string, any>, storeCurrency?: string }) {
  // Fetch More to love
  const moreToLove = await db.product.findMany({
    where: { status: 'ACTIVE' },
    take: 20,
    orderBy: { price: 'asc' }, // different sorting just to mix it up
    include: { images: true }
  });

  return (
    <section 
      style={{
        paddingTop: settings["pt"] ? `${settings["pt"]}px` : '48px',
        paddingBottom: settings["pb"] ? `${settings["pb"]}px` : '48px',
        backgroundColor: settings["bg"] || undefined,
      }}
    >
      <div className={`mx-auto px-4 lg:px-8 w-full ${settings["width"] === "full" ? "max-w-none" : "max-w-[1500px]"}`}>
        <MoreToLoveClient 
          initialProducts={moreToLove} 
          title={settings["title"] || "More to love"} 
          storeCurrency={storeCurrency} 
        />
      </div>
    </section>
  );
}
