import Link from "next/link";
import { db } from "@/lib/prisma";
import { MoreToLoveClient } from "@/app/(storefront)/MoreToLoveClient";

export default async function ElegantHome() {
  const allCategories = await db.category.findMany({ take: 50 });
  
  const settingsRecords = await db.setting.findMany({
    where: {
      OR: [
        { key: { startsWith: "storefront_" } },
        { key: "storeCurrency" }
      ]
    }
  });

  const settings = settingsRecords.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  // Filter categories based on selected IDs from the Theme Editor
  let categories = allCategories;
  try {
    const selectedIds: string[] = JSON.parse(settings["storefront_elegant_category_ids"] || "[]");
    if (selectedIds.length > 0) {
      // Show only selected categories, in the order they were selected
      categories = selectedIds
        .map(id => allCategories.find(c => c.id === id))
        .filter(Boolean) as typeof allCategories;
    } else {
      categories = allCategories.slice(0, 12);
    }
  } catch {
    categories = allCategories.slice(0, 12);
  }

  const storeCurrency = settings["storeCurrency"] || "USD";
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  const heroImage = settings["storefront_elegant_hero_image"] || "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1500";
  const heroTitle = settings["storefront_elegant_hero_title"] || "LAMPS BY YZ";

  // Fetch products
  const bestSellers = await db.product.findMany({ where: { status: 'ACTIVE' }, take: 4, include: { images: true }, orderBy: { createdAt: 'desc' } });
  const featured = await db.product.findMany({ where: { status: 'ACTIVE' }, take: 4, include: { images: true }, orderBy: { price: 'desc' } });
  const newArrivals = await db.product.findMany({ where: { status: 'ACTIVE' }, take: 4, include: { images: true }, orderBy: { createdAt: 'desc' } });
  const allProducts = await db.product.findMany({ where: { status: 'ACTIVE' }, take: 20, include: { images: true }, orderBy: { createdAt: 'desc' }, skip: 4 });

  const ProductCard = ({ product }: { product: any }) => {
    const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";
    const displayPrice = product.salePrice || product.price;
    return (
      <Link href={`/products/${product.slug}`} className="group flex flex-col">
        <div className="relative aspect-[4/5] bg-[#F5F5F5] overflow-hidden mb-4">
          {product.salePrice && (
            <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold px-2 py-1 z-10 tracking-widest uppercase">
              Sale
            </span>
          )}
          <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
        </div>
        <h4 className="text-sm text-black font-medium tracking-wide uppercase mb-1">{product.name}</h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900">{formatPrice(displayPrice)}</span>
          {product.salePrice && <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>}
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      
      {/* Top Categories */}
      {settings["storefront_show_elegant_categories"] !== "false" && (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center justify-center w-full max-w-4xl mb-2">
              <div className="flex-1 h-px bg-gray-300"></div>
              <h2 className="text-2xl md:text-3xl font-black uppercase mx-6 tracking-wider">
                {settings["storefront_elegant_categories_title"] || "TOP CATEGORY"}
              </h2>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            <p className="text-sm text-gray-500">
              {settings["storefront_elegant_categories_subtitle"] || "Most Viewed Categories with Affordable Prices"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
            {categories.map((cat, i) => {
              const image = cat.imageId || `https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=300`;
              return (
                <Link href={`/products`} key={cat.id} className="flex flex-col items-center group">
                  <div className="w-full aspect-square bg-[#F5F5F5] overflow-hidden mb-3">
                    <img 
                      src={image} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={cat.name} 
                    />
                  </div>
                  <span className="text-sm text-gray-800 text-center">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Hero Banner */}
      {settings["storefront_show_elegant_hero"] !== "false" && (
        <div className="w-full h-[60vh] md:h-[80vh] relative mb-20">
          <img src={heroImage} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white text-center px-4">
            <h2 className="text-4xl md:text-7xl font-serif tracking-widest uppercase mb-8">{heroTitle}</h2>
            <Link href="/products" className="bg-white text-black px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
        
        {/* Best Sellers */}
        {settings["storefront_show_elegant_best_sellers"] !== "false" && (
          <section className="mb-24">
            <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 tracking-widest uppercase">
              {settings["storefront_elegant_bestsellers_title"] || "Best Sellers"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {bestSellers.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
            <div className="mt-12 text-center">
              <Link href="/products" className="inline-block border border-black text-black px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors">
                View All
              </Link>
            </div>
          </section>
        )}

        {/* Featured Plants */}
        {settings["storefront_show_elegant_featured_plants"] !== "false" && (
          <section className="mb-24">
            <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 tracking-widest uppercase">
              {settings["storefront_elegant_featured_title"] || "Featured Plants"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {featured.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {settings["storefront_show_elegant_new_arrivals"] !== "false" && (
          <section className="mb-24">
            <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 tracking-widest uppercase">
              {settings["storefront_elegant_new_arrivals_title"] || "New Arrivals"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {newArrivals.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}

      </div>
      
      {/* Infinite Scroll Products using MoreToLoveClient but styled minimally?
          Wait, MoreToLoveClient has its own styling. Let's just render a title and then MoreToLoveClient. */}
      <div className="bg-[#fcfcfc] py-20 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <MoreToLoveClient 
            initialProducts={allProducts} 
            title="All Products"
            storeCurrency={storeCurrency} 
          />
        </div>
      </div>

    </div>
  );
}
