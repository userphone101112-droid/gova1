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
    <div className="flex items-center gap-0.5">
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
    <div className={`overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-muted p-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.REVIEWS.TITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.REVIEWS.TITLE.uuid}`} className="text-lg">{t('merchant.reviews.title')}</h2>
          </div>
          <button className="gap-1 text-sm">
            {t('merchant.reviews.viewAll')} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 px-6 pb-6 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-muted/30">
          <h1 className="text-5xl font-bold">{averageRating.toFixed(1)}</h1>
          <StarRating rating={Math.round(averageRating)} size="lg" />
          <span className="text-sm text-muted-foreground">{t('merchant.reviews.basedOn')} {totalReviews.toLocaleString()} {t('merchant.reviews.reviews')}</span>
        </div>

        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center gap-2">
              <span data-ui-instance-id={String(stars)} className="w-16 text-sm font-medium">{stars} {stars === 1 ? t('merchant.reviews.star') : t('merchant.reviews.stars')}</span>
              <div className="h-2 flex-1 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-warning" style={{ width: `${calculateRatingPercentage(ratingDistribution, stars)}%` }} />
              </div>
              <span data-ui-instance-id={String(stars)} className="w-12 text-right text-sm text-muted-foreground">
                {
                  ratingDistribution[stars === 5 ? 'five' : stars === 4 ? 'four' : stars === 3 ? 'three' : stars === 2 ? 'two' : 'one'].toLocaleString()
                }
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-outline-variant" />

      <div className="divide-y">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3 p-4 sm:p-5 transition-colors hover:bg-muted/50">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden relative">
                <Image data-ui-instance-id={review.id} src={review.customer.avatar} alt={review.customer.name} fill className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span data-ui-instance-id={review.id} className="font-medium text-sm">{review.customer.name}</span>
                  <StarRating rating={review.rating} />
                  <span data-ui-instance-id={review.id} className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</span>
                </div>
                <span data-ui-instance-id={review.id} className="text-xs text-muted-foreground mt-0.5">{t('merchant.reviews.purchased')}: {review.productName}</span>
              </div>
            </div>

            <p data-ui-instance-id={review.id} className="text-sm leading-relaxed pl-0 sm:pl-13">{review.comment}</p>

            <div className="flex items-center gap-4 pl-0 sm:pl-13">
              <button data-ui-instance-id={review.id} className="gap-1.5 h-8 text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span className="text-xs">{t('merchant.reviews.helpful')} ({review.helpful})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerReviews;
