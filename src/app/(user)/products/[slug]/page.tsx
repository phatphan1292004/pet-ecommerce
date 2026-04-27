import { getProductBySlug } from "@/features/guest/product/servers";
import ProductDetailPage from "@/features/guest/product/components/product-detail";
import {
  getReplies,
  getReviews,
  type UiReview,
} from "@/features/customer/review";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get("userId")?.value;
  const product = await getProductBySlug(slug, currentUserId);

  if (!product) {
    notFound();
  }

  const isLoggedIn = !!currentUserId;

  let initialComments: UiReview[] = [];
  const reviewResult = await getReviews({ productId: product._id, limit: 50 });

  if (reviewResult.success && reviewResult.data) {
    initialComments = await Promise.all(
      reviewResult.data.map(async (review) => {
        const replyResult = await getReplies(review.id, { limit: 50 });
        if (replyResult.success && replyResult.data?.length) {
          return { ...review, replies: replyResult.data };
        }
        return review;
      }),
    );
  }

  return (
    <ProductDetailPage
      product={product}
      initialComments={initialComments}
      isLoggedIn={isLoggedIn}
      currentUserId={currentUserId}
    />
  );
}
