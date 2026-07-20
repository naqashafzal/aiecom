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
  const [count, setCount] = useState(10);
  const [productId, setProductId] = useState<string>("all");
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative" | "random">("random");
  const [useAI, setUseAI] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateFakeReviews({
        count,
        productId: productId === "all" ? null : productId,
        sentiment,
        useAI,
        autoApprove
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
