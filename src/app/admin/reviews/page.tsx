import { db } from "@/lib/prisma";
import ReviewsClient from "./ReviewsClient";
import GenerateFakeReviewsButton from "./GenerateFakeReviewsButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [reviews, total, products] = await Promise.all([
    db.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true, images: { take: 1 } } }
      },
      skip,
      take: limit
    }),
    db.review.count(),
    db.product.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Reviews</h1>
          <p className="text-sm text-gray-500">Manage and moderate customer reviews for your products.</p>
        </div>
        <GenerateFakeReviewsButton products={products} />
      </div>
      
      <ReviewsClient 
        initialReviews={reviews} 
        currentPage={page} 
        totalPages={totalPages} 
      />
    </div>
  );
}
