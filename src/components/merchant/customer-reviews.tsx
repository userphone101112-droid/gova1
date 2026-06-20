'use client';
import { ChevronRight, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import Image from 'next/image';


import type { Review, RatingDistribution } from '@/lib/merchant/types';
import { formatRelativeTime, calculateRatingPercentage } from '@/lib/merchant/utils';
import { MERCHANT, useTranslation } from '@/platform/ui';

interface CustomerReviewsProps {
  reviews: Review[];
  ratingDistribution: RatingDistribution;
  averageRating: number;
  totalReviews: number;
  className?: string;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  return (
    <div data-ui-uuid={MERCHANT.SHELL.CUSTOMER_REVIEWS_L27.uuid} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );
}

export function CustomerReviews({
  reviews,
  ratingDistribution,
  averageRating,
  totalReviews,
  className,
}: CustomerReviewsProps) {
  const { t } = useTranslation();
  return (
    <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.CONTAINER.uuid} className={`overflow-hidden ${className}`}>
      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_TITLE_CONTAINER_L48.uuid} className="p-6">
        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_TITLE_CONTAINER_L49.uuid} className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_TITLE_CONTAINER_L50.uuid} className="flex items-center gap-2">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_TITLE_CONTAINER_L51.uuid} className="rounded-full bg-muted p-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.TITLE.uuid} className="text-lg">{t(MERCHANT.MERCHANT_PROFILE.REVIEWS.TITLE)}</h2>
          </div>
          <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.VIEW_ALL_BUTTON.uuid} className="gap-1 text-sm">
            {t(MERCHANT.MERCHANT_PROFILE.REVIEWS.VIEW_ALL)} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_BASED_ON_CONTAINER_L62.uuid} className="grid gap-6 px-6 pb-6 sm:grid-cols-2">
        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_BASED_ON_CONTAINER_L63.uuid} className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-muted/30">
          <h1 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.AVERAGE_RATING.uuid} className="text-5xl font-bold">{averageRating.toFixed(1)}</h1>
          <StarRating rating={Math.round(averageRating)} size="lg" />
          <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.REVIEW_COUNT_TEXT.uuid} className="text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.REVIEWS.BASED_ON)} {totalReviews.toLocaleString()} {t(MERCHANT.MERCHANT_PROFILE.REVIEWS.REVIEWS)}</span>
        </div>

        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_BASED_ON_CONTAINER_L69.uuid} className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_BASED_ON_CONTAINER_L71.uuid} key={stars} className="flex items-center gap-2">
              <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.RATING_LABEL.uuid} data-ui-instance-id={String(stars)} className="w-16 text-sm font-medium">{stars} {stars === 1 ? t(MERCHANT.MERCHANT_PROFILE.REVIEWS.STAR) : t(MERCHANT.MERCHANT_PROFILE.REVIEWS.STARS)}</span>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_BASED_ON_CONTAINER_L73.uuid} className="h-2 flex-1 bg-surface-container rounded-full overflow-hidden">
                <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_BASED_ON_CONTAINER_L74.uuid} className="h-full bg-warning" style={{ width: `${calculateRatingPercentage(ratingDistribution, stars)}%` }} />
              </div>
              <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.RATING_PERCENT.uuid} data-ui-instance-id={String(stars)} className="w-12 text-right text-sm text-muted-foreground">
                {
                  ratingDistribution[stars === 5 ? 'five' : stars === 4 ? 'four' : stars === 3 ? 'three' : stars === 2 ? 'two' : 'one'].toLocaleString()
                }
              </span>
            </div>
          ))}
        </div>
      </div>

      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_TITLE_CONTAINER_L86.uuid} className="h-px bg-outline-variant" />

      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_PURCHASED_CONTAINER_L88.uuid} className="divide-y">
        {reviews.map((review) => (
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_PURCHASED_CONTAINER_L90.uuid} key={review.id} className="space-y-3 p-4 sm:p-5 transition-colors hover:bg-muted/50">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_PURCHASED_CONTAINER_L91.uuid} className="flex items-start gap-3">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_PURCHASED_CONTAINER_L92.uuid} className="h-10 w-10 rounded-full overflow-hidden relative">
                <Image data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.REVIEW_AVATAR.uuid} data-ui-instance-id={review.id} src={review.customer.avatar} alt={review.customer.name} fill className="object-cover" />
              </div>

              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_PURCHASED_CONTAINER_L96.uuid} className="flex-1 min-w-0">
                <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_PURCHASED_CONTAINER_L97.uuid} className="flex flex-wrap items-center gap-2">
                  <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.REVIEWER_NAME.uuid} data-ui-instance-id={review.id} className="font-medium text-sm">{review.customer.name}</span>
                  <StarRating rating={review.rating} />
                  <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.REVIEW_TIME.uuid} data-ui-instance-id={review.id} className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</span>
                </div>
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.REVIEW_PRODUCT.uuid} data-ui-instance-id={review.id} className="text-xs text-muted-foreground mt-0.5">{t(MERCHANT.MERCHANT_PROFILE.REVIEWS.PURCHASED)}: {review.productName}</span>
              </div>
            </div>

            <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.REVIEW_COMMENT.uuid} data-ui-instance-id={review.id} className="text-sm leading-relaxed pl-0 sm:pl-13">{review.comment}</p>

            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_HELPFUL_CONTAINER_L108.uuid} className="flex items-center gap-4 pl-0 sm:pl-13">
              <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.HELPFUL_BUTTON.uuid} data-ui-instance-id={review.id} className="gap-1.5 h-8 text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_REVIEWS_HELPFUL_SPAN_L111.uuid} className="text-xs">{t(MERCHANT.MERCHANT_PROFILE.REVIEWS.HELPFUL)} ({review.helpful})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerReviews;
