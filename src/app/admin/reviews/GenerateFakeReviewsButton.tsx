"use client";

import { useState, useTransition } from "react";
import { generateFakeReviews } from "./actions";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GenerateFakeReviewsButton({ products = [] }: { products?: { id: string, name: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [count, setCount] = useState(10);
  const [productId, setProductId] = useState<string>("all");
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative" | "random">("random");
  const [useAI, setUseAI] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);
  const [manualText, setManualText] = useState("");

  const handleGenerate = () => {
    startTransition(async () => {
      const manualReviews = mode === "manual" 
        ? manualText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        : [];

      if (mode === "manual" && manualReviews.length === 0) {
        alert("Please enter at least one manual review.");
        return;
      }

      const result = await generateFakeReviews({
        count,
        productId: productId === "all" ? null : productId,
        sentiment,
        useAI,
        autoApprove,
        manualReviews
      });
      
      if (result.success) {
        setShowModal(false);
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        Generate Fake Reviews
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-bold">Generate Fake Reviews</h2>
            
            {/* Tabs */}
            <div className="flex rounded-md bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`flex-1 rounded-sm py-1.5 text-sm font-medium transition-all ${mode === "auto" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                Auto Generate
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex-1 rounded-sm py-1.5 text-sm font-medium transition-all ${mode === "manual" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                Manual Input
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Target Product
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Products (Random Selection)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {mode === "auto" ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Number of Reviews
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Sentiment
                    </label>
                    <select
                      value={sentiment}
                      onChange={(e) => setSentiment(e.target.value as any)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="random">Random (Mixed)</option>
                      <option value="positive">Positive (4-5 Stars)</option>
                      <option value="neutral">Neutral (3 Stars)</option>
                      <option value="negative">Negative (1-2 Stars)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useAI"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="useAI" className="text-sm font-medium text-gray-700">
                      Use AI (Gemini) to generate realistic text
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Paste Reviews (1 review per line)
                    </label>
                    <textarea
                      rows={6}
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder="Line 1: I love this product!&#10;Line 2: It's okay, nothing special.&#10;Line 3: Terrible quality..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Fake users and dates will be automatically assigned.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Star Rating Pattern
                    </label>
                    <select
                      value={sentiment}
                      onChange={(e) => setSentiment(e.target.value as any)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="random">Random (Mixed Stars)</option>
                      <option value="positive">All Positive (4-5 Stars)</option>
                      <option value="neutral">All Neutral (3 Stars)</option>
                      <option value="negative">All Negative (1-2 Stars)</option>
                    </select>
                  </div>
                </>
              )}
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoApprove"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoApprove" className="text-sm font-medium text-gray-700">
                  Automatically approve generated reviews
                </label>
              </div>

            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
