"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, CreditCard, Lock, CheckCircle2, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processCheckout, getPaymentSettings } from "./actions";
import { useCurrency } from "@/components/storefront/currency-provider";

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { formatPrice, currencyCode } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"information" | "shipping" | "payment" | "success">("information");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash on Delivery");
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  
  // Shipping State
  const [availableRates, setAvailableRates] = useState<any[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethodName, setShippingMethodName] = useState("Standard Shipping");
  const [isFetchingRates, setIsFetchingRates] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "PK",
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

  const total = getCartTotal();
  const shipping = shippingCost;
  const taxes = total * 0.08; // 8% tax rate
  const grandTotal = total + shipping + taxes;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = async (e: React.FormEvent | undefined, nextStep: "shipping" | "payment" | "success") => {
    if (e) e.preventDefault();
    
    if (nextStep === "shipping") {
      setIsFetchingRates(true);
      const res = await getApplicableShippingRates(formData.country, total);
      setIsFetchingRates(false);
      
      if (res.success && res.rates && res.rates.length > 0) {
        setAvailableRates(res.rates);
        setSelectedRateId(res.rates[0].id);
        setShippingCost(res.rates[0].price);
        setShippingMethodName(res.rates[0].name);
        setStep("shipping");
      } else {
        alert(res.error || "No shipping available for this region. Please try another address.");
        return;
      }
    } else if (nextStep === "payment") {
      setStep(nextStep);
    } else if (nextStep === "success") {
      if (paymentMethod !== "Cash on Delivery" && !transactionId) {
        alert("Please provide the Transaction ID or Receipt Number.");
        return;
      }
      setIsProcessing(true);
      // Process checkout via Server Action
      const result = await processCheckout({
        items,
        shipping: formData,
        totals: {
          subtotal: total,
          shipping,
          tax: taxes,
          grandTotal
        },
        paymentMethod,
        shippingMethod: shippingMethodName,
        transactionId
      });

      setIsProcessing(false);
      
      if (result.success) {
        setOrderId(result.orderNumber ? result.orderNumber.toString() : (result.orderId as string));
        setStep("success");
        clearCart();
      } else {
        alert("Checkout failed! Please try again.");
      }
    } else {
      setStep(nextStep);
    }
  };

  if (!mounted) return null;

  if (step === "success") {
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
          Thank you for shopping with Aura. Your order <span className="font-bold text-foreground">#{orderId || 'PENDING'}</span> has been placed successfully and your payment has been processed.
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
    <div className="min-h-screen bg-muted/10">
      <div className="container mx-auto px-4 py-8 lg:py-12 flex flex-col-reverse lg:flex-row gap-8 lg:gap-16">
        
        {/* Left Side - Forms */}
        <div className="flex-1 max-w-2xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm font-medium text-muted-foreground mb-8">
            <button onClick={() => setStep("information")} className={`${step === "information" ? "text-primary" : "hover:text-foreground"} transition-colors`}>Information</button>
            <ChevronRight className="h-4 w-4 mx-2" />
            <button onClick={() => setStep("shipping")} disabled={step === "information"} className={`${step === "shipping" ? "text-primary" : ""} disabled:opacity-50 transition-colors`}>Shipping</button>
            <ChevronRight className="h-4 w-4 mx-2" />
            <button disabled className={`${step === "payment" ? "text-primary" : "opacity-50"}`}>Payment</button>
          </nav>

          <AnimatePresence mode="wait">
            {/* INFORMATION STEP */}
            {step === "information" && (
              <motion.form 
                key="info"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={(e) => handleNextStep(e, "shipping")} 
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Email address" className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="First name" className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Last name" className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                    <input type="text" name="address1" value={formData.address1} onChange={handleInputChange} required placeholder="Address" className="col-span-2 w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                    <input type="text" name="address2" value={formData.address2} onChange={handleInputChange} placeholder="Apartment, suite, etc. (optional)" className="col-span-2 w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required placeholder="City" className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                    <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required placeholder="Postal code" className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Phone number" className="col-span-2 w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow" />
                    <select name="country" value={formData.country} onChange={handleInputChange} required className="col-span-2 w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-shadow">
                      <option value="PK">Pakistan</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="AE">United Arab Emirates</option>
                      <option value="SA">Saudi Arabia</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Link href="/cart" className="text-primary hover:underline text-sm font-medium flex items-center">
                    <ChevronLeft className="h-4 w-4 mr-1"/> Return to cart
                  </Link>
                  <Button type="submit" size="lg" disabled={isFetchingRates} className="rounded-full px-8 h-12 shadow-md">
                    {isFetchingRates ? "Calculating..." : "Continue to Shipping"}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* SHIPPING STEP */}
            {step === "shipping" && (
              <motion.form 
                key="ship"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={(e) => handleNextStep(e, "payment")} 
                className="space-y-8"
              >
                <div className="border rounded-xl p-4 bg-background space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="text-sm"><span className="text-muted-foreground mr-4">Contact</span> {formData.email}</div>
                    <button type="button" onClick={() => setStep("information")} className="text-xs font-semibold text-primary">Change</button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm"><span className="text-muted-foreground mr-4">Ship to</span> {formData.address1}, {formData.city}, {formData.postalCode}</div>
                    <button type="button" onClick={() => setStep("information")} className="text-xs font-semibold text-primary">Change</button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Shipping Method</h2>
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
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button type="button" onClick={() => setStep("information")} className="text-primary hover:underline text-sm font-medium flex items-center">
                    <ChevronLeft className="h-4 w-4 mr-1"/> Return to information
                  </button>
                  <Button type="submit" size="lg" className="rounded-full px-8 h-12 shadow-md">
                    Continue to Payment
                  </Button>
                </div>
              </motion.form>
            )}

            {/* PAYMENT STEP */}
            {step === "payment" && (
              <motion.div 
                key="pay"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                 <div className="border rounded-xl p-4 bg-background space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="text-sm"><span className="text-muted-foreground mr-4">Contact</span> {formData.email}</div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div className="text-sm"><span className="text-muted-foreground mr-4">Ship to</span> {formData.address1}, {formData.city}, {formData.postalCode}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm"><span className="text-muted-foreground mr-4">Method</span> {shippingMethodName}</div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
                  
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
                      
                      <div className="border rounded-xl bg-background overflow-hidden p-6 sm:p-8 shadow-sm">
                        {paymentMethod === "Cash on Delivery" ? (
                          <div className="text-center">
                            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Pay upon delivery</h3>
                            <p className="text-muted-foreground mb-8 text-sm">You can pay using cash directly to the courier when your order arrives.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="bg-muted/30 p-6 rounded-lg border">
                              <h3 className="font-bold text-lg mb-4">Please transfer {formatPrice(grandTotal)} to:</h3>
                              
                              {paymentMethod === "Bank Transfer" && (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Bank Name</span> <span className="font-bold">{paymentSettings.bankName}</span></div>
                                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Account Title</span> <span className="font-bold">{paymentSettings.bankTitle}</span></div>
                                  <div className="flex justify-between"><span className="text-muted-foreground">IBAN / Account Number</span> <span className="font-bold font-mono text-primary">{paymentSettings.bankIban}</span></div>
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
                        )}
                        
                        <div className="mt-8 pt-6 border-t text-center">
                          <Button onClick={(e) => handleNextStep(e, "success")} disabled={isProcessing || (paymentMethod !== "Cash on Delivery" && !transactionId)} size="lg" className="rounded-full px-12 h-12 shadow-lg shadow-primary/30 w-full sm:w-auto">
                            {isProcessing ? "Processing..." : "Complete Order"}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button type="button" onClick={() => setStep("shipping")} className="text-primary hover:underline text-sm font-medium flex items-center">
                    <ChevronLeft className="h-4 w-4 mr-1"/> Return to shipping
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side - Order Summary */}
        <div className="w-full lg:w-[450px] shrink-0">
          <div className="bg-background rounded-2xl border shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 rounded-lg bg-muted border overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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

            <div className="border-t pt-4 space-y-3 text-sm mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-foreground">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated taxes</span>
                <span className="font-medium text-foreground">{formatPrice(taxes)}</span>
              </div>
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
