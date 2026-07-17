"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { WishlistButton } from "../../WishlistButton";
import { Truck, ShieldCheck, Headset, RefreshCw } from "lucide-react";

export function ElegantHeroSection({ settings }: { settings: Record<string, any> }) {
  const heroImage = settings["image"] || "/placeholder.png";
  const heroTitle = settings["title"] || "LAMPS BY YZ";

  return (
    <div className="w-full h-[50vh] md:h-[60vh] relative mb-12 overflow-hidden bg-black">
      <motion.div 
        initial={{ scale: 1.1, opacity: 0.8 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image src={heroImage} fill className="object-cover opacity-80" alt="Hero" priority />
      </motion.div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 bg-gradient-to-b from-black/40 via-transparent to-black/40">
        <motion.h2 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-[0.25em] uppercase mb-8 font-light drop-shadow-lg"
        >
          {heroTitle}
        </motion.h2>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/products" className="bg-transparent border border-white text-white px-10 py-3.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-300">
            Discover
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// 2. Elegant Categories Section
export function ElegantCategoriesSection({ settings, categories }: { settings: Record<string, any>, categories: any[] }) {
  const title = settings["title"] || "TOP CATEGORY";
  const subtitle = settings["subtitle"] || "Most Viewed Categories with Affordable Prices";

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col items-center mb-16"
      >
        <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-[0.15em] mb-4 text-gray-900">
          {title}
        </h2>
        <div className="w-12 h-[1px] bg-gray-400 mb-5"></div>
        <p className="text-sm text-gray-500 font-light tracking-wide">{subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8">
        {categories.map((cat, i) => {
          const image = cat.imageId || "/placeholder.png";
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/products?category=${cat.slug}`} className="flex flex-col group block">
                <div className="relative overflow-hidden aspect-square bg-[#F5F5F5] mb-4">
                  <Image 
                    src={image} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    alt={cat.name} 
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="w-full text-center px-2">
                  <span className="text-xs md:text-[13px] text-gray-900 font-medium tracking-widest uppercase">{cat.name}</span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
}

// 3. Elegant Best Sellers
export function ElegantBestSellersSection({ settings, products, storeCurrency }: { settings: Record<string, any>, products: any[], storeCurrency: string }) {
  const title = settings["title"] || "BEST SELLERS";
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mb-24"
      >
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-2xl md:text-3xl font-serif text-center tracking-[0.15em] uppercase text-gray-900 mb-4">
            {title}
          </h2>
          <div className="w-12 h-[1px] bg-gray-400"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product, i) => {
            const image = product.images?.[0]?.url || "/placeholder.png";
            const displayPrice = product.salePrice || product.price;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/products/${product.slug}`} className="group flex flex-col relative">
                  <div className="relative aspect-[3/4] bg-[#f9f9f9] overflow-hidden mb-5">
                    {product.salePrice && (
                      <span className="absolute top-4 left-4 bg-black text-white text-[9px] px-2 py-1 z-10 tracking-[0.2em] uppercase">
                        Sale
                      </span>
                    )}
                    <Image src={image} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={product.name} sizes="(max-width: 768px) 50vw, 25vw" />
                    
                    {/* Wishlist Button - Overlayed on image */}
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <WishlistButton productId={product.id} className="bg-white/90 hover:bg-white shadow-sm" />
                    </div>
                  </div>
                  <h4 className="text-[13px] text-gray-900 font-medium tracking-wider uppercase mb-2 leading-relaxed">{product.name}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-gray-600 font-light tracking-wide">{formatPrice(displayPrice)}</span>
                    {product.salePrice && <span className="text-[11px] text-gray-400 line-through font-light">{formatPrice(product.price)}</span>}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Link href="/products" className="inline-block border border-gray-900 text-gray-900 px-10 py-3.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-gray-900 hover:text-white transition-all duration-300">
            View Collection
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}

// 4. Elegant Brand Story
export function ElegantStorySection({ settings }: { settings: Record<string, any> }) {
  const title = settings["title"] || "Our Philosophy";
  const description = settings["description"] || "We believe in creating timeless pieces that bring warmth, elegance, and beauty to your everyday spaces. Every item is crafted with passion and meticulous attention to detail.";
  const image = settings["image"] || "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000";
  const buttonText = settings["buttonText"] || "Discover More";
  const buttonLink = settings["buttonLink"] || "/about";
  const imagePosition = settings["imagePosition"] === "right" ? "right" : "left";

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 bg-[#FAFAFA]">
      <div className={`flex flex-col ${imagePosition === "right" ? "md:flex-row-reverse" : "md:flex-row"} items-stretch bg-white`}>
        {/* Image Side */}
        <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-[600px] overflow-hidden">
          <motion.div 
            initial={{ scale: 1.05 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <Image src={image} fill className="object-cover" alt="Brand Story" />
          </motion.div>
        </div>

        {/* Text Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-12 md:p-24 text-center md:text-left relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: imagePosition === "right" ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md"
          >
            <h2 className="text-3xl md:text-4xl font-serif tracking-[0.1em] text-gray-900 mb-8 uppercase leading-tight">
              {title}
            </h2>
            <div className={`w-12 h-[1px] bg-gray-400 mb-8 mx-auto ${imagePosition === "right" ? "md:mx-0 md:mr-auto" : "md:ml-0 md:mr-auto"}`}></div>
            <p className="text-[15px] leading-relaxed text-gray-600 mb-10 font-light">
              {description}
            </p>
            <Link href={buttonLink} className="inline-block border-b border-gray-900 text-gray-900 pb-1 text-xs font-bold tracking-[0.2em] uppercase hover:text-gray-500 hover:border-gray-500 transition-all duration-300">
              {buttonText}
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// 5. Elegant Features / Value Props
export function ElegantFeaturesSection({ settings }: { settings: Record<string, any> }) {
  const bg = settings["bg"] || "#FAFAFA";
  
  const features = [
    { icon: Truck, title: "Complimentary Shipping", desc: "On all orders above $200" },
    { icon: ShieldCheck, title: "Secure Checkout", desc: "100% protected payments" },
    { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
    { icon: Headset, title: "24/7 Concierge", desc: "Dedicated support for you" }
  ];

  return (
    <div style={{ backgroundColor: bg }} className="py-20 border-y border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                <feature.icon className="h-6 w-6 text-gray-900" strokeWidth={1.5} />
              </div>
              <h3 className="text-[13px] font-bold tracking-[0.15em] uppercase text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 font-light">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 6. Elegant Newsletter
export function ElegantNewsletterSection({ settings }: { settings: Record<string, any> }) {
  const title = settings["title"] || "Join Our Inner Circle";
  const subtitle = settings["subtitle"] || "Subscribe to receive updates, access to exclusive deals, and more.";
  const bg = settings["bg"] || "#111111";
  const textColor = settings["textColor"] || "#FFFFFF";

  return (
    <div style={{ backgroundColor: bg, color: textColor }} className="py-24 relative overflow-hidden">
      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif tracking-[0.1em] uppercase mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-[15px] font-light opacity-80 mb-10 tracking-wide max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 justify-center items-stretch" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-transparent border-b border-white/30 px-2 py-3 outline-none focus:border-white transition-colors text-sm font-light placeholder:text-white/50"
              style={{ color: textColor }}
            />
            <button 
              type="submit" 
              className="bg-white text-black px-10 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-200 transition-colors mt-4 sm:mt-0"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
