"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowUpRight, Loader2, Bot, User, Maximize2, Minimize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminChatAgent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/admin-chat',
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-3 flex items-center mb-6 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
      >
        <div className="flex-1 text-sm font-medium text-indigo-900 py-1 px-2">
          ✨ Ask Omni-Agent anything about your store...
        </div>
        <div className="flex items-center gap-3 pr-2 text-indigo-500">
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">New AI</span>
          <div className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-indigo-200 mb-6 flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'h-[600px]' : 'h-[400px]'}`}>
      {/* Header */}
      <div className="p-3 border-b border-[#e1e3e5] flex items-center justify-between bg-indigo-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-1.5 rounded-md">
            <Bot className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="font-semibold text-sm text-indigo-900">Aura Omni-Agent</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium ml-2">Beta</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:bg-white" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:bg-white" onClick={() => setIsOpen(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 text-sm">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-3">
            <Sparkles className="h-8 w-8 text-indigo-200" />
            <p className="max-w-[250px]">I can fetch live data, search products, update stock, and fulfill orders. What do you need?</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button onClick={() => handleInputChange({ target: { value: "How many active products do we have?" } } as any)} className="bg-white border text-xs px-2 py-1 rounded-md hover:bg-gray-50 shadow-sm">Check stock</button>
              <button onClick={() => handleInputChange({ target: { value: "Show me the 3 most recent orders." } } as any)} className="bg-white border text-xs px-2 py-1 rounded-md hover:bg-gray-50 shadow-sm">Recent orders</button>
            </div>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className="h-7 w-7 shrink-0 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" />
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
              }`}>
                {m.content}
                {m.toolInvocations?.map((tool) => (
                  <div key={tool.toolCallId} className="mt-2 text-xs bg-gray-100 p-2 rounded border text-gray-600 font-mono">
                    {tool.state === 'result' ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" /> Completed: {tool.toolName}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Running: {tool.toolName}...
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {m.role === 'user' && (
                <div className="h-7 w-7 shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3 justify-start">
            <div className="h-7 w-7 shrink-0 bg-indigo-100 rounded-full flex items-center justify-center border border-indigo-200">
              <Bot className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-[#e1e3e5] rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a command or question..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

// CheckCircle2 needs to be imported, doing it below to avoid messing up lines
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
