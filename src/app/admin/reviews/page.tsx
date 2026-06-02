import { db } from "@/lib/prisma";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true, images: { take: 1 } } }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product Reviews</h1>
        <p className="text-sm text-gray-500">Manage and moderate customer reviews for your products.</p>
      </div>
      
      <ReviewsClient initialReviews={reviews} />
    </div>
  );
}
