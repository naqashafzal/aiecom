"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
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
              <Link href={`/products?category=${cat.slug}`} className="flex flex-col group relative block overflow-hidden aspect-[4/5] bg-[#F5F5F5]">
                <Image 
                  src={image} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  alt={cat.name} 
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 w-full text-center px-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-sm md:text-[15px] text-white font-medium tracking-widest uppercase drop-shadow-md">{cat.name}</span>
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
                <Link href={`/products/${product.slug}`} className="group flex flex-col">
                  <div className="relative aspect-[3/4] bg-[#f9f9f9] overflow-hidden mb-5">
                    {product.salePrice && (
                      <span className="absolute top-4 left-4 bg-black text-white text-[9px] px-2 py-1 z-10 tracking-[0.2em] uppercase">
                        Sale
                      </span>
                    )}
                    <Image src={image} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={product.name} sizes="(max-width: 768px) 50vw, 25vw" />
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
