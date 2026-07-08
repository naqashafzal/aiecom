"use client";

import { useState } from "react";
import { getOrderStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/components/storefront/currency-provider";

export default function TrackOrderPage() {
  const { formatPrice } = useCurrency();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phone) {
      setError("Please enter both Order Number and Phone Number");
      return;
    }

    setIsSearching(true);
    setError("");
    
    // Parse order number to int
    const parsedOrderNum = parseInt(orderNumber.replace(/\D/g, ""), 10);
    
    const res = await getOrderStatus(parsedOrderNum, phone);
    
    if (res.success && res.order) {
      setOrder(res.order);
    } else {
      setOrder(null);
      setError(res.error || "Order not found");
    }
    
    setIsSearching(false);
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "PENDING":
      case "CONFIRMED":
        return { icon: Clock, color: "text-yellow-500", label: "Processing", desc: "We are preparing your order." };
      case "PROCESSING":
        return { icon: Package, color: "text-blue-500", label: "Packed", desc: "Your order is packed and ready to be handed to the courier." };
      case "SHIPPED":
        return { icon: Truck, color: "text-purple-500", label: "Shipped", desc: "Your order is on the way!" };
      case "DELIVERED":
        return { icon: CheckCircle, color: "text-green-500", label: "Delivered", desc: "Your order has been delivered." };
      case "CANCELLED":
      case "REFUNDED":
        return { icon: CheckCircle, color: "text-red-500", label: status, desc: "This order has been cancelled or refunded." };
      default:
        return { icon: Clock, color: "text-gray-500", label: status, desc: "" };
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Track Your Order</h1>
          <p className="text-muted-foreground text-lg">Enter your order details below to see the current status of your shipment.</p>
        </div>

        <div className="bg-background border shadow-sm rounded-2xl p-6 md:p-10 mb-8 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Order Number</label>
                <input 
                  type="text" 
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. 1001" 
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Used during checkout" 
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSearching} className="w-full h-12 rounded-lg text-lg font-semibold flex items-center justify-center">
              {isSearching ? "Searching..." : <><Search className="w-5 h-5 mr-2" /> Find Order</>}
            </Button>
          </form>
        </div>

        <AnimatePresence>
          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background border shadow-sm rounded-2xl overflow-hidden"
            >
              <div className="bg-primary/5 p-6 border-b flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order</p>
                  <h3 className="text-xl font-bold">#{order.orderNumber}</h3>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Placed</p>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(order.grandTotal)}</p>
                </div>
              </div>

              <div className="p-6 md:p-10">
                {/* Status Timeline */}
                <div className="mb-12 text-center">
                  {(() => {
                    const status = getStatusDetails(order.status);
                    const StatusIcon = status.icon;
                    return (
                      <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-background border-4 shadow-sm mb-4 ${status.color.replace('text', 'border')}`}>
                          <StatusIcon className={`w-10 h-10 ${status.color}`} />
                        </div>
                        <h2 className={`text-2xl font-bold mb-2 ${status.color}`}>{status.label}</h2>
                        <p className="text-muted-foreground">{status.desc}</p>
                        
                        {order.trackingNumber && (
                          <div className="mt-6 p-4 bg-muted/50 rounded-lg border inline-block">
                            <p className="text-sm text-muted-foreground mb-1">Tracking Number ({order.shippingMethod})</p>
                            <p className="font-mono font-bold tracking-wider">{order.trackingNumber}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Items */}
                <h4 className="font-bold mb-4 border-b pb-2">Order Items</h4>
                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center font-bold text-muted-foreground">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{item.name}</p>
                          {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                        </div>
                      </div>
                      <p className="font-semibold">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
