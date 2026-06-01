import Link from "next/link";
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCcw, Store, ChevronRight, Zap, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TOP_STORES = [
  { id: "s1", name: "TechNova Official", rating: 4.9, followers: "1.2M", image: "https://images.unsplash.com/photo-1531297172867-4d6537bbbd63?q=80&w=200" },
  { id: "s2", name: "Aesthetic Home", rating: 4.8, followers: "850K", image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=200" },
  { id: "s3", name: "Urban Streetwear", rating: 4.7, followers: "2.1M", image: "https://images.unsplash.com/photo-1550614000-4b95d4ebf51c?q=80&w=200" },
  { id: "s4", name: "Gadget Central", rating: 4.9, followers: "3.4M", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=200" },
];

export default async function StorefrontHome() {
  const categories = await db.category.findMany();
  const products = await db.product.findMany({
    where: { status: 'ACTIVE' },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });

  // Fetch dynamic theme settings
  const settingsRecords = await db.setting.findMany({
    where: {
      key: {
        in: [
          "storefront_announcement_text",
          "storefront_hero_title",
          "storefront_hero_subtitle",
          "storefront_hero_image"
        ]
      }
    }
  });

  const settings = settingsRecords.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  const announcementText = settings["storefront_announcement_text"] || "🎉 SuperTech Week! Get up to 70% off on top electronics.";
  const heroTitle = settings["storefront_hero_title"] || "Premium Quality, Unbeatable Prices.";
  const heroSubtitle = settings["storefront_hero_subtitle"] || "Shop directly from top-rated vendors worldwide.";
  const heroImage = settings["storefront_hero_image"] || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop";

  const feature1Title = settings["storefront_feature_1_title"] || "Buyer Protection";
  const feature1Desc = settings["storefront_feature_1_desc"] || "Secure payments & refunds";

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      
      {/* AliExpress Style Top Banner (Optional promo strip) */}
      {settings["storefront_show_announcement"] !== "false" && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium tracking-wide flex justify-center items-center gap-2">
          {announcementText} <Link href="/deals" className="underline font-bold">Shop Now</Link>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        
        {/* Main Hero & Categories Split */}
        {settings["storefront_show_hero"] !== "false" && (
          <div className="flex flex-col lg:flex-row gap-6 mb-12 h-auto lg:h-[450px]">
          
          {/* Dense Category Sidebar */}
          <div className="hidden lg:flex flex-col w-64 bg-background rounded-2xl shadow-sm border py-4 overflow-y-auto no-scrollbar relative z-10">
            <h3 className="px-4 font-bold text-lg mb-2 flex items-center gap-2">
              <Menu className="h-5 w-5 text-primary" /> Categories
            </h3>
            <ul className="flex flex-col space-y-1 mt-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="flex items-center justify-between px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium text-muted-foreground hover:pl-6">
                    {cat.name} <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="px-4 py-2 text-sm text-muted-foreground">No categories found.</li>
              )}
            </ul>
          </div>

          {/* Main Hero Carousel Area */}
          <div className="flex-1 relative rounded-2xl overflow-hidden shadow-md group">
            <img 
              src={heroImage} 
              alt="Hero promotional banner" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
              <div className="p-8 md:p-12 max-w-lg text-white">
                <span className="inline-block py-1 px-3 rounded-full bg-primary text-xs font-bold uppercase tracking-wider mb-4 animate-bounce">
                  New Arrivals
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8 font-medium">
                  {heroSubtitle}
                </p>
                <Button size="lg" className="rounded-full px-8 text-md shadow-lg shadow-primary/30">
                  Explore Products <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right Side Welcome / User Panel */}
          <div className="hidden xl:flex flex-col w-72 gap-6">
            <div className="bg-background rounded-2xl p-6 shadow-sm border text-center flex flex-col items-center justify-center flex-1">
              <div className="w-16 h-16 bg-muted rounded-full mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg">Welcome to Aura</h3>
              <p className="text-sm text-muted-foreground mb-4">Sign in for personalized recommendations and exclusive deals.</p>
              <div className="flex w-full gap-2">
                <Button className="flex-1 rounded-full shadow-sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="secondary" className="flex-1 rounded-full">Register</Button>
              </div>
            </div>
            <div className="bg-primary/10 rounded-2xl p-6 shadow-sm border border-primary/20 flex-1 flex flex-col justify-center relative overflow-hidden">
              <Zap className="absolute -right-4 -bottom-4 h-24 w-24 text-primary opacity-10" />
              <h3 className="font-bold text-primary text-xl mb-1">New User Gift</h3>
              <p className="text-sm font-medium mb-4">Get $5 off your first order!</p>
              <Button size="sm" variant="default" className="w-fit rounded-full px-6 shadow-md shadow-primary/20">Claim Now</Button>
            </div>
          </div>
        </div>
        )}

        {/* Value Props */}
        {settings["storefront_show_features"] !== "false" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: ShieldCheck, title: feature1Title, desc: feature1Desc },
            { icon: Truck, title: "Fast Delivery", desc: "Global logistics network" },
            { icon: Star, title: "Top Rated Vendors", desc: "Verified quality products" },
            { icon: RefreshCcw, title: "Free Returns", desc: "Within 15 days" },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 bg-background p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-none mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Latest Products Section */}
        {settings["storefront_show_products"] !== "false" && (
          <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary fill-primary" /> Latest Products
            </h2>
            <Link href="/products" className="ml-auto text-sm font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-background rounded-2xl border">
                No products found. Add some from the admin dashboard!
              </div>
            ) : products.map((product) => {
              const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500";
              const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : null;
              const displayPrice = product.salePrice || product.price;

              return (
                <Link href={`/product/${product.slug}`} key={product.id} className="group bg-background rounded-2xl p-4 border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all flex flex-col">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-muted">
                    {discount && (
                      <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-black px-2 py-1 rounded-md z-10">
                        -{discount}%
                      </span>
                    )}
                    <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-black text-xl text-primary">${displayPrice.toFixed(2)}</span>
                    {product.salePrice && (
                      <span className="text-xs text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mb-1 overflow-hidden">
                    <div className="bg-primary/50 h-full rounded-full" style={{width: `${Math.min(100, Math.max(10, product.stock))}%`}}></div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{product.stock} in stock</span>
                </Link>
              );
            })}
          </div>
        </section>
        )}

        {/* Premium Vendor Stores */}
        {settings["storefront_show_stores"] !== "false" && (
          <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" /> Premium Stores
            </h2>
            <Link href="/stores" className="text-sm font-semibold text-primary hover:underline">
              All Stores
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOP_STORES.map((store) => (
              <div key={store.id} className="bg-background rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all group">
                <div className="h-24 w-full bg-muted overflow-hidden">
                   <img src={store.image} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Store Cover" />
                </div>
                <div className="p-5 pt-0 relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-xl bg-background shadow-md border-4 border-background -mt-8 mb-3 overflow-hidden flex items-center justify-center">
                    <Store className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{store.name}</h3>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-4 w-full">
                    <span className="flex items-center"><Star className="h-3 w-3 text-primary fill-primary mr-1"/> {store.rating}</span>
                    <span>•</span>
                    <span>{store.followers} Followers</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                    Visit Store
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

      </div>
    </div>
  );
}

