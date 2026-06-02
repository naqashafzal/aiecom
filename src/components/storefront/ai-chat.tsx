"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, X, MessageSquare, Send, Loader2, ShoppingBag, PlusCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useCurrency } from "@/components/storefront/currency-provider";

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat();
  const addItem = useCartStore((state) => state.addItem);
  const { formatPrice } = useCurrency();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl transition-transform hover:scale-105 z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] bg-background border shadow-2xl rounded-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <h3 className="font-bold text-sm">Aura AI Agent</h3>
              <p className="text-[10px] opacity-80">Your personal shopping assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-10">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Hello! I am the Aura AI Agent. I can help you find products, check features, or assist with your shopping.</p>
            </div>
          )}
          
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-white border rounded-bl-none text-foreground'}`}>
                {m.content ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground italic text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Searching store database...
                  </div>
                )}

                {/* Render Tool Calls (Product Recommendations) */}
                {m.toolInvocations?.map((toolInvocation) => {
                  if (toolInvocation.state === 'result' && (toolInvocation.toolName === 'searchProducts' || toolInvocation.toolName === 'getFeaturedProducts')) {
                    const products = toolInvocation.result;
                    if (products && products.length > 0) {
                      return (
                        <div key={toolInvocation.toolCallId} className="mt-3 space-y-2">
                          {products.map((p: any) => (
                            <Link key={p.id} href={`/products/${p.slug}`}>
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors border text-xs text-foreground cursor-pointer">
                                <div className="h-10 w-10 bg-background rounded border flex items-center justify-center shrink-0">
                                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">{p.name}</p>
                                  <p className="text-primary font-bold">{formatPrice(p.price)}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      );
                    } else if (toolInvocation.state === 'result') {
                       return <div key={toolInvocation.toolCallId} className="mt-2 text-xs text-muted-foreground italic">No products found matching the request.</div>
                    }
                  } else if (toolInvocation.state === 'result' && toolInvocation.toolName === 'prepareCartAddition') {
                    const result = toolInvocation.result;
                    if (result.success) {
                      const item = result.item;
                      const isAdded = addedItems[toolInvocation.toolCallId];
                      return (
                        <div key={toolInvocation.toolCallId} className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                          <div className="flex gap-3">
                            <div className="h-12 w-12 rounded-lg bg-white border overflow-hidden shrink-0">
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs text-foreground line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Quantity: {item.quantity}</p>
                              <p className="text-primary font-bold text-xs mt-0.5">{formatPrice(item.price)}</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => {
                              addItem(item);
                              setAddedItems(prev => ({ ...prev, [toolInvocation.toolCallId]: true }));
                            }}
                            disabled={isAdded}
                            size="sm" 
                            className="w-full rounded-full h-8 text-xs font-semibold shadow-sm"
                          >
                            {isAdded ? (
                              <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Added to Cart</>
                            ) : (
                              <><PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Confirm Add to Cart</>
                            )}
                          </Button>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-background border-t rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input || ''}
              onChange={(e) => {
                if (handleInputChange) {
                  handleInputChange(e);
                } else if (setInput) {
                  setInput(e.target.value);
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1 bg-muted/50 border rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <Button type="submit" size="icon" disabled={isLoading || !(input?.trim())} className="rounded-full h-10 w-10 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
