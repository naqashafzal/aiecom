"use client";

import { useEffect, useState } from "react";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Your Cart
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4">
                  <div className="p-6 bg-muted rounded-full">
                    <ShoppingBag className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">Your cart is empty.</p>
                  <Button onClick={() => setIsOpen(false)} variant="outline" className="mt-4 rounded-full">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    key={item.id} 
                    className="flex gap-4 group"
                  >
                    <div className="h-24 w-24 rounded-lg bg-muted overflow-hidden flex-shrink-0 border">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium line-clamp-2 leading-tight pr-4">{item.name}</h3>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground mt-1">Variant: {item.variant.name}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border rounded-full h-8">
                          <button 
                            className="px-2 text-muted-foreground hover:text-foreground"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button 
                            className="px-2 text-muted-foreground hover:text-foreground"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="border-t bg-muted/20 p-6">
                <div className="flex justify-between text-base font-medium mb-4">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="space-y-3">
                  <Button asChild size="lg" className="w-full rounded-full shadow-lg h-12 text-md">
                    <Link href="/checkout" onClick={() => setIsOpen(false)}>
                      Checkout <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full rounded-full h-12 bg-background"
                    onClick={() => setIsOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
