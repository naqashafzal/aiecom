"use client";

import { useState, useEffect } from "react";
import { Star, Truck, ShieldCheck, Heart, ArrowLeft, Minus, Plus, Share2, Store, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCurrency } from "@/components/storefront/currency-provider";
import { formatDistanceToNow } from "date-fns";
import { PluginSlot } from "@/components/plugins/PluginSlot";
import { submitProductReview } from "./actions";
import { motion } from "framer-motion";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import Image from "next/image";

export default function ProductClient({ product, settings, initialIsWishlisted }: { product: any, settings: Record<string, string>, initialIsWishlisted?: boolean }) {
  const images = product.images?.length > 0 
    ? product.images.map((i: any) => i.url) 
    : ["/placeholder.png"];
    
  // Parse variants
  const variants = product.variants?.map((v: any) => ({
    id: v.id,
    name: v.name,
    sku: v.sku,
    price: v.price || product.salePrice || product.price,
    stock: v.stock,
    attributes: v.attributes
  })) || [];

  const specs = Array.isArray(product.specifications) ? product.specifications : [];

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(variants.length > 0 ? variants[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [fakeSales, setFakeSales] = useState({ sold: 0, hours: 0 });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isTimerActive = !!searchParams.get("downloadUrl");
  
  const addItem = useCartStore((state) => state.addItem);
  const addViewedItem = useRecentlyViewedStore((state) => state.addItem);
  const recentlyViewedItems = useRecentlyViewedStore((state) => state.items);
  const { formatPrice } = useCurrency();

  const policy1Title = settings?.["storefront_policy_1_title"] || "Free Worldwide Shipping";
  const policy2Title = settings?.["storefront_policy_2_title"] || "2 Year Extended Warranty";

  const primaryImage = images[0];

  useEffect(() => {
    setMounted(true);
    addViewedItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.salePrice || product.price,
      image: primaryImage
    });
    
    // Personalization Engine tracking (if categories exist)
    if (product.categories && product.categories.length > 0) {
      document.cookie = `last_viewed_category=${product.categories[0].id}; path=/; max-age=2592000`; // 30 days
    }

    // Generate pseudo-random deterministic fake sales based on product length
    const nameHash = product.name.length;
    setFakeSales({
      sold: Math.floor(Math.random() * 25) + 3 + (nameHash % 5),
      hours: Math.floor(Math.random() * 18) + 4
    });
  }, [product.id, product.slug, product.name, product.price, product.salePrice, primaryImage, addViewedItem, product.categories]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewMessage(null);
    
    const res = await submitProductReview(product.id, reviewRating, reviewTitle, reviewComment);
    
    setIsSubmittingReview(false);
    if (res.success) {
      setReviewMessage({ type: "success", text: "Your review has been submitted and is awaiting approval." });
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
    } else {
      setReviewMessage({ type: "error", text: res.error || "An error occurred." });
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : (product.salePrice || product.price),
      image: images[0],
      quantity: quantity,
      variant: selectedVariant ? { id: selectedVariant.id, name: selectedVariant.name } : undefined
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Close the cart drawer that gets auto-opened by addItem
    useCartStore.getState().setIsOpen(false);
    router.push("/checkout");
  };

  const displayPrice = selectedVariant ? selectedVariant.price : (product.salePrice || product.price);
  const basePrice = product.price;
  const showFakeSales = settings?.["storefront_fake_sales_enabled"] === "true";
  
  // Advertisement Settings
  const adProductEnabled = settings?.["ad_product_enabled"] === "true";
  const adProductScript = settings?.["ad_product_script"];
  const adTimerEnabled = settings?.["ad_timer_enabled"] === "true";
  const adTimerScript = settings?.["ad_timer_script"];
  
  // Store info
  const storeName = product.store ? product.store.name : (settings?.["footer_store_name"] || "ZS DECOR Official Store");
  const storeRating = product.store ? (product.store.rating || 5.0) : 4.9;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Shop
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row gap-4">
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible no-scrollbar p-1">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'}`}
              >
                <Image src={img} alt={`Thumbnail ${idx}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-square bg-muted rounded-2xl overflow-hidden relative group">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-semibold text-lg">
                {product.reviews && product.reviews.length > 0 
                  ? (product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length).toFixed(1) 
                  : "5.0"
                }
              </span>
              <span className="text-muted-foreground ml-1">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>
            <div className="flex gap-2 relative">
              <WishlistButton productId={product.id} initialIsWishlisted={initialIsWishlisted} className="rounded-full shadow-sm" />
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground bg-muted/50 hover:bg-muted">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">{product.name}</h1>
          
          {mounted && showFakeSales && fakeSales.sold > 0 && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 w-fit px-3 py-1.5 rounded-full mb-4">
              <Flame className="h-4 w-4 fill-red-500" />
              <span className="font-semibold text-sm">{fakeSales.sold} sold in last {fakeSales.hours} hours</span>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl font-black text-primary">{formatPrice(displayPrice)}</div>
            {product.salePrice && (
              <div className="text-lg text-muted-foreground line-through">{formatPrice(basePrice)}</div>
            )}
            {product.salePrice && (
              <div className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                Super Deal
              </div>
            )}
          </div>
          
          {/* Store Card */}
          <div className="flex items-center justify-between p-4 mb-8 bg-muted/30 border rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-background border flex items-center justify-center overflow-hidden">
                <Store className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-sm">{storeName}</h4>
                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                  <Star className="h-3 w-3 text-primary fill-primary mr-1" />
                  <span className="font-semibold text-foreground">{storeRating.toFixed(1)}</span>
                  <span className="mx-1">•</span>
                  <span>Trusted Seller</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">Visit Store</Button>
          </div>

          {/* Dynamic Plugin Slot */}
          <PluginSlot name="product_sidebar" />

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-3 flex items-center justify-between">
                Variant: <span className="text-muted-foreground font-normal">{selectedVariant?.name}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedVariant?.id === v.id ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary/50'}`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex items-center border-2 border-input rounded-full h-14 w-full sm:w-32 bg-background">
              <button 
                className="flex-1 flex justify-center items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-semibold text-lg w-10 text-center">{quantity}</span>
              <button 
                className="flex-1 flex justify-center items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-4 w-full">
                <Button 
                  onClick={handleAddToCart}
                  size="lg" 
                  variant="outline"
                  className="flex-1 h-14 rounded-full text-lg shadow-sm hover:shadow-md transition-all border-2 border-primary/20 hover:border-primary"
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  size="lg" 
                  className="flex-1 h-14 rounded-full text-lg shadow-xl hover:shadow-primary/25 transition-all"
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                </Button>
              </div>

              {settings?.["whatsappNumber"] && (
                <Button
                  onClick={() => {
                    const num = settings["whatsappNumber"].replace(/[^0-9]/g, "");
                    const text = encodeURIComponent(`Hi, I'm interested in the ${product.name}. Can you help me?`);
                    window.open(`https://wa.me/${num}?text=${text}`, "_blank");
                  }}
                  size="lg"
                  variant="outline"
                  className="w-full h-14 rounded-full text-lg border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Ask on WhatsApp
                </Button>
              )}
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-4 py-6 border-y mb-8 bg-muted/20 rounded-2xl px-6">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium whitespace-pre-wrap">{policy1Title.replace(" ", "\n")}</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium whitespace-pre-wrap">{policy2Title.replace(" ", "\n")}</span>
            </div>
          </div>

          {/* Specifications */}
          {specs.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">Specifications</h3>
              <div className="space-y-3">
                {specs.map((spec: any, idx: number) => (
                  <div key={idx} className="flex border-b pb-3 border-dashed">
                    <span className="w-1/2 text-muted-foreground">{spec.name}</span>
                    <span className="w-1/2 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Page Advertisement Slot */}
      {adProductEnabled && adProductScript && (
        <div className="mt-8 flex justify-center w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: adProductScript }} />
      )}

      {/* Product Description Section */}
      {product.description && (
        <div className="mt-16 border-t pt-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
              Product Description
              <div className="flex-1 h-px bg-border" />
            </h2>
            <div className="bg-muted/20 rounded-2xl p-6 md:p-8">
              <div 
                className="text-muted-foreground leading-relaxed text-base prose prose-sm sm:prose-base dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {isTimerActive && adTimerEnabled && adTimerScript && (
          <div className="flex justify-center w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: adTimerScript }} />
        )}
        
        <PluginSlot name="product_description_bottom" />

        {isTimerActive && adTimerEnabled && adTimerScript && (
          <div className="flex justify-center w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: adTimerScript }} />
        )}
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t pt-12" id="reviews">
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
          Customer Reviews
          <div className="flex-1 h-px bg-border" />
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review List */}
          <div className="lg:col-span-2 space-y-8">
            {(!product.reviews || product.reviews.length === 0) ? (
              <div className="bg-muted/20 rounded-2xl p-8 text-center text-muted-foreground">
                <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="bg-background border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {review.user.image ? (
                          <Image src={review.user.image} alt={review.user.name} width={40} height={40} className="rounded-full bg-muted object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {review.user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{review.user.name || "Anonymous User"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    {review.title && <h4 className="font-bold mb-2">{review.title}</h4>}
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write Review Form */}
          <div className="bg-muted/10 border rounded-2xl p-6 lg:p-8 h-fit sticky top-24">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            
            {reviewMessage && (
              <div className={`p-4 rounded-xl mb-6 text-sm ${reviewMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {reviewMessage.text}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`h-8 w-8 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Title (Optional)</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  placeholder="Sum up your experience"
                  className="w-full p-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Review</label>
                <textarea
                  required
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="What did you like or dislike?"
                  rows={4}
                  className="w-full p-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmittingReview || !reviewComment.trim()}
                className="w-full h-12 rounded-xl text-base font-semibold"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Recently Viewed Section */}
      {mounted && recentlyViewedItems.filter(item => item.id !== product.id).length > 0 && (
        <div className="mt-24 border-t pt-16">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Recently Viewed</h2>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
            {recentlyViewedItems.filter(item => item.id !== product.id).map((item) => (
              <div key={item.id} className="min-w-[200px] w-[200px] sm:min-w-[250px] sm:w-[250px] snap-start group">
                <Link href={`/products/${item.slug}`}>
                  <div className="aspect-[4/5] rounded-xl bg-muted overflow-hidden mb-4 relative">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill sizes="(max-width: 640px) 200px, 250px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                  <p className="font-bold text-primary mt-1">{formatPrice(item.price)}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
