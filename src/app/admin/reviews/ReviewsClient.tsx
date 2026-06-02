"use client";

import { useState, useTransition } from "react";
import { Star, CheckCircle, XCircle, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toggleReviewApproval, deleteReview } from "./actions";

export default function ReviewsClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      // Optimistic update
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved: !currentStatus } : r));
      const result = await toggleReviewApproval(id, !currentStatus);
      if (!result.success) {
        // Revert on failure
        setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved: currentStatus } : r));
        alert(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    startTransition(async () => {
      // Optimistic update
      setReviews(prev => prev.filter(r => r.id !== id));
      const result = await deleteReview(id);
      if (!result.success) {
        // We would need to refetch here ideally, but for now just alert
        alert(result.error);
        window.location.reload();
      }
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-12 text-center text-gray-500">
        No reviews have been submitted yet.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="px-6 py-3 text-left font-medium">Product</th>
            <th className="px-6 py-3 text-left font-medium">Review</th>
            <th className="px-6 py-3 text-left font-medium">Status</th>
            <th className="px-6 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {reviews.map((review) => (
            <tr key={review.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 w-1/4 align-top">
                <div className="flex items-center gap-3">
                  {review.product.images?.[0] ? (
                    <img src={review.product.images[0].url} alt="" className="w-10 h-10 rounded object-cover border" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 border" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 line-clamp-1" title={review.product.name}>
                      {review.product.name}
                    </div>
                    <Link href={`/products/${review.product.slug}`} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                      View Product <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 w-1/2 align-top">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                    />
                  ))}
                </div>
                {review.title && <div className="font-bold text-gray-900 mb-1">{review.title}</div>}
                <div className="text-gray-600 mb-2 whitespace-pre-wrap">{review.comment}</div>
                <div className="text-xs text-gray-400">
                  By {review.user.name || review.user.email} on {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 align-top">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  review.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {review.isApproved ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {review.isApproved ? "Approved" : "Pending"}
                </span>
              </td>
              <td className="px-6 py-4 text-right align-top">
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => handleToggleStatus(review.id, review.isApproved)}
                    disabled={isPending}
                    className="text-blue-600 hover:text-blue-900 font-medium text-xs disabled:opacity-50"
                  >
                    {review.isApproved ? "Hide" : "Approve"}
                  </button>
                  <button 
                    onClick={() => handleDelete(review.id)}
                    disabled={isPending}
                    className="text-red-600 hover:text-red-900 font-medium text-xs disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
