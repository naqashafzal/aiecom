"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, CreditCard, Lock, CheckCircle2, ChevronLeft, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processCheckout, getPaymentSettings, validateCoupon, saveAbandonedCart } from "./actions";
import { getApplicableShippingRates } from "./shipping-actions";
import { useCurrency } from "@/components/storefront/currency-provider";

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { formatPrice, currencyCode } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash on Delivery");
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  
  // Shipping State
  const [availableRates, setAvailableRates] = useState<any[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethodName, setShippingMethodName] = useState("Standard Shipping");
  const [isFetchingRates, setIsFetchingRates] = useState(true);

  // Discount State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    phone: "",
  });
  
  useEffect(() => {
    setMounted(true);
    // Fetch payment settings
    getPaymentSettings().then(res => {
      setPaymentSettings(res);
      // set default payment method
      if (res.codEnabled) setPaymentMethod("Cash on Delivery");
      else if (res.bankEnabled) setPaymentMethod("Bank Transfer");
      else if (res.easypaisaEnabled) setPaymentMethod("EasyPaisa");
      else if (res.jazzcashEnabled) setPaymentMethod("JazzCash");
    });
  }, []);

  useEffect(() => {
    if (!mounted || items.length === 0) return;
    setIsFetchingRates(true);
    getApplicableShippingRates("PK", getCartTotal()).then(res => {
      setIsFetchingRates(false);
      if (res.success && res.rates && res.rates.length > 0) {
        setAvailableRates(res.rates);
        setSelectedRateId(res.rates[0].id);
        setShippingCost(res.rates[0].price);
        setShippingMethodName(res.rates[0].name);
      }
    });
  }, [mounted, items.length, getCartTotal]);

  const total = getCartTotal();
  const shipping = shippingCost;
  const taxes = 0; // Tax disabled as per request
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = total * (appliedCoupon.value / 100);
    } else if (appliedCoupon.type === "FIXED") {
      discountAmount = appliedCoupon.value;
    } else if (appliedCoupon.type === "FREE_SHIPPING") {
      discountAmount = shipping; // We'll just discount the shipping cost from total
    }
  }
  
  const grandTotal = Math.max(0, total + shipping + taxes - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    
    const res = await validateCoupon(couponCode, total);
    setIsApplyingCoupon(false);
    
    if (res.success && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponCode("");
    } else {
      setCouponError(res.error || "Invalid coupon");
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (paymentMethod !== "Cash on Delivery" && !transactionId) {
      alert("Please provide the Transaction ID or Receipt Number.");
      return;
    }

    setIsProcessing(true);

    // Save abandoned cart before processing
    saveAbandonedCart(formData.email, items, total).catch(console.error);
    
    const names = formData.fullName.trim().split(" ");
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || " ";

    const shippingData = {
      email: formData.email,
      firstName: firstName,
      lastName: lastName,
      address1: formData.address,
      address2: "",
      city: formData.city,
      state: "N/A",
      postalCode: "00000",
      country: "PK",
      phone: formData.phone,
    };

    // Process checkout via Server Action
    const result = await processCheckout({
      items,
      shipping: shippingData,
      totals: {
        subtotal: total,
        shipping,
        tax: taxes,
        grandTotal
      },
      paymentMethod,
      shippingMethod: shippingMethodName,
      transactionId,
      currencyCode,
      couponId: appliedCoupon?.id
    });

    setIsProcessing(false);
    
    if (result.success) {
      setOrderId(result.orderNumber ? result.orderNumber.toString() : (result.orderId as string));
      setIsSuccess(true);
      clearCart();
    } else {
      alert("Checkout failed! Please try again.");
    }
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <CheckCircle2 className="h-24 w-24 text-green-500 mb-6 mx-auto" />
        </motion.div>
        <h1 className="text-4xl font-extrabold mb-4">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          Thank you for shopping with ZS Decor. Your order <span className="font-bold text-foreground">#{orderId || 'PENDING'}</span> has been placed successfully and your payment has been processed.
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">You cannot proceed to checkout without items.</p>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row relative pb-24 lg:pb-0">
      {/* Left Side - Forms */}
      <div className="flex-1 bg-background pt-8 pb-14 px-4 sm:px-6 lg:px-12 xl:px-24 lg:pt-16 lg:border-r">
        <form onSubmit={handleCompleteOrder} className="max-w-2xl mx-auto lg:ml-auto lg:mr-12 space-y-12">
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
            <Link href="/cart" className="text-primary hover:underline text-sm font-medium flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1"/> Back to cart
            </Link>
          </div>

          <div className="space-y-8">
            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <input 
                type="email" 
                name="email" 
                autoComplete="email"
                value={formData.email} 
                onChange={handleInputChange} 
                required 
                placeholder="Email address" 
                className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" 
              />
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  name="fullName" 
                  autoComplete="name"
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Full Name" 
                  className="sm:col-span-2 w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" 
                />
                <input 
                  type="text" 
                  name="address" 
                  autoComplete="shipping address-line1"
                  value={formData.address} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Complete Address (Street, House No, etc.)" 
                  className="sm:col-span-2 w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" 
                />
                <input 
                  type="text" 
                  name="city" 
                  autoComplete="address-level2"
                  value={formData.city} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="City" 
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" 
                />
                <input 
                  type="tel" 
                  name="phone" 
                  autoComplete="tel"
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Phone Number" 
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" 
                />
              </div>
            </section>

            {/* Shipping Method */}
            <section>
              <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
              {isFetchingRates ? (
                <div className="h-14 border rounded-xl bg-muted/30 animate-pulse flex items-center px-4">
                  <div className="h-4 bg-muted w-32 rounded"></div>
                </div>
              ) : availableRates.length > 0 ? (
                <div className="border rounded-xl bg-background overflow-hidden divide-y">
                  {availableRates.map(rate => (
                    <label key={rate.id} className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="shipping_method" 
                          checked={selectedRateId === rate.id}
                          onChange={() => {
                            setSelectedRateId(rate.id);
                            setShippingCost(rate.price);
                            setShippingMethodName(rate.name);
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary" 
                        />
                        <span className="font-medium">{rate.name}</span>
                      </div>
                      <span className="font-semibold">{rate.price === 0 ? "Free" : formatPrice(rate.price)}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-xl text-destructive font-medium bg-destructive/10">
                  No shipping available for this region.
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              {!paymentSettings ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {paymentSettings.codEnabled && (
                      <label className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'Cash on Delivery' ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}>
                        <input type="radio" name="pm" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Cash on Delivery</span>
                      </label>
                    )}
                    {paymentSettings.bankEnabled && (
                      <label className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'Bank Transfer' ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}>
                        <input type="radio" name="pm" checked={paymentMethod === 'Bank Transfer'} onChange={() => setPaymentMethod('Bank Transfer')} className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Bank Transfer</span>
                      </label>
                    )}
                    {paymentSettings.easypaisaEnabled && (
                      <label className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'EasyPaisa' ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}>
                        <input type="radio" name="pm" checked={paymentMethod === 'EasyPaisa'} onChange={() => setPaymentMethod('EasyPaisa')} className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-green-600">EasyPaisa</span>
                      </label>
                    )}
                    {paymentSettings.jazzcashEnabled && (
                      <label className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all ${paymentMethod === 'JazzCash' ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}>
                        <input type="radio" name="pm" checked={paymentMethod === 'JazzCash'} onChange={() => setPaymentMethod('JazzCash')} className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-red-600">JazzCash</span>
                      </label>
                    )}
                  </div>
                  
                  {paymentMethod !== "Cash on Delivery" && (
                    <div className="border rounded-xl bg-background overflow-hidden p-6 shadow-sm mb-6">
                      <div className="space-y-6">
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <h3 className="font-bold text-lg mb-4">Please transfer {formatPrice(grandTotal)} to:</h3>
                          
                          {paymentMethod === "Bank Transfer" && (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Bank Name</span> <span className="font-bold">{paymentSettings.bankName}</span></div>
                              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Account Title</span> <span className="font-bold">{paymentSettings.bankTitle}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">IBAN / A/C No</span> <span className="font-bold font-mono text-primary">{paymentSettings.bankIban}</span></div>
                            </div>
                          )}
                          
                          {paymentMethod === "EasyPaisa" && (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Method</span> <span className="font-bold text-green-600">EasyPaisa</span></div>
                              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Account Title</span> <span className="font-bold">{paymentSettings.easypaisaTitle}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Account Number</span> <span className="font-bold font-mono text-primary">{paymentSettings.easypaisaNumber}</span></div>
                            </div>
                          )}

                          {paymentMethod === "JazzCash" && (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Method</span> <span className="font-bold text-red-600">JazzCash</span></div>
                              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Account Title</span> <span className="font-bold">{paymentSettings.jazzcashTitle}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Account Number</span> <span className="font-bold font-mono text-primary">{paymentSettings.jazzcashNumber}</span></div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-bold mb-2">Transaction ID / Receipt Number <span className="text-red-500">*</span></label>
                          <p className="text-xs text-muted-foreground mb-3">After transferring the amount, please enter the Transaction ID or Reference Number below to verify your payment.</p>
                          <input 
                            type="text" 
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g. 1234567890" 
                            required
                            className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow font-mono" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Sticky bottom CTA for Mobile, Normal position for Desktop */}
          <div className="fixed lg:static bottom-0 left-0 right-0 p-4 lg:p-0 bg-background lg:bg-transparent border-t lg:border-t-0 z-40 mt-8 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] lg:shadow-none">
            <Button 
              type="submit" 
              disabled={isProcessing || isFetchingRates || availableRates.length === 0 || (paymentMethod !== "Cash on Delivery" && !transactionId)} 
              size="lg" 
              className="rounded-full w-full h-14 shadow-lg shadow-primary/20 text-lg font-bold transition-all"
            >
              {isProcessing ? "Processing Order..." : `Complete Order • ${formatPrice(grandTotal)}`}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Side - Order Summary */}
      <div className="w-full lg:w-[45%] bg-muted/20 pt-8 pb-14 px-4 sm:px-6 lg:px-12 lg:pt-16 border-b lg:border-b-0 lg:border-l">
        <div className="max-w-xl mx-auto lg:mx-0 sticky top-8">
          <div className="bg-transparent rounded-none border-none shadow-none p-0">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 rounded-lg bg-muted border overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    <span className="absolute -top-2 -right-2 bg-muted-foreground text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-background">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                    {item.variant && <p className="text-xs text-muted-foreground">{item.variant.name}</p>}
                  </div>
                  <div className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Code Section */}
            <div className="border-t pt-4 mb-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Discount code or gift card" 
                  className="flex-1 h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow uppercase"
                  disabled={appliedCoupon || isApplyingCoupon}
                />
                <Button 
                  onClick={handleApplyCoupon} 
                  disabled={!couponCode.trim() || appliedCoupon || isApplyingCoupon}
                  className="h-10"
                >
                  {isApplyingCoupon ? "..." : "Apply"}
                </Button>
              </div>
              {couponError && <p className="text-destructive text-xs mt-2 font-medium">{couponError}</p>}
              
              {appliedCoupon && (
                <div className="mt-3 flex items-center justify-between bg-muted/50 px-3 py-2 rounded-md border text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{appliedCoupon.code}</span>
                    <span className="text-muted-foreground text-xs">
                      ({appliedCoupon.type === 'PERCENTAGE' ? `${appliedCoupon.value}% off` : 
                        appliedCoupon.type === 'FIXED' ? `${formatPrice(appliedCoupon.value)} off` : 'Free Shipping'})
                    </span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-destructive shrink-0" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-3 text-sm mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-3 border-b">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {isFetchingRates 
                    ? <span className="text-muted-foreground text-xs font-normal">Calculating...</span> 
                    : (shipping === 0 ? "Free" : formatPrice(shipping))}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated taxes</span>
                <span className="font-medium text-foreground">{formatPrice(taxes)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 flex justify-between items-end">
              <span className="text-lg font-bold">Total</span>
              <div className="text-right">
                <span className="text-xs text-muted-foreground mr-2">{currencyCode}</span>
                <span className="text-2xl font-black text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
