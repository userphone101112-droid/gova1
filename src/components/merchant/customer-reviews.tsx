'use client';

import {
  UiCard,
  UiDiv,
  UiH1,
  UiH2,
  UiP,
  UiLabel,
  UiImage,
  UiButton,
  UiSpan,
  MERCHANT,
  COMMON_LAYOUT,
  COMMON_TYPOGRAPHY,
  COMMON_FORMS,
  COMMON_MEDIA,
  useTranslation,
} from '@/platform/ui';
import type { Review, RatingDistribution } from '@/lib/merchant/types';
import { formatRelativeTime, calculateRatingPercentage } from '@/lib/merchant/utils';
import { ChevronRight, Star, ThumbsUp, MessageSquare } from 'lucide-react';

interface CustomerReviewsProps {
  reviews: Review[];
  ratingDistribution: RatingDistribution;
  averageRating: number;
  totalReviews: number;
  className?: string;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'} ${star <= rating ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground'}`}
        />
      ))}
    </UiDiv>
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
    <UiCard ui={MERCHANT.MERCHANT_PROFILE.REVIEWS.CONTAINER} className={`overflow-hidden ${className}`}>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-6">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-row items-center justify-between space-y-0 pb-4">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-muted p-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </UiDiv>
            <UiH2 ui={MERCHANT.MERCHANT_PROFILE.REVIEWS.TITLE} className="text-lg">{t(MERCHANT.MERCHANT_PROFILE.REVIEWS.TITLE)}</UiH2>
          </UiDiv>
          <UiButton ui={COMMON_FORMS.BUTTON} variant="ghost" size="sm" className="gap-1 text-sm">
            {t(MERCHANT.MERCHANT_PROFILE.REVIEWS.VIEW_ALL)} <ChevronRight className="h-4 w-4" />
          </UiButton>
        </UiDiv>
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid gap-6 px-6 pb-6 sm:grid-cols-2">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-muted/30">
          <UiH1 ui={COMMON_TYPOGRAPHY.H1} className="text-5xl font-bold">{averageRating.toFixed(1)}</UiH1>
          <StarRating rating={Math.round(averageRating)} size="lg" />
          <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.REVIEWS.BASED_ON)} {totalReviews.toLocaleString()} {t(MERCHANT.MERCHANT_PROFILE.REVIEWS.REVIEWS)}</UiLabel>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => (
            <UiDiv key={stars} ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="w-16 text-sm font-medium">{stars} {stars === 1 ? t(MERCHANT.MERCHANT_PROFILE.REVIEWS.STAR) : t(MERCHANT.MERCHANT_PROFILE.REVIEWS.STARS)}</UiLabel>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <UiDiv
                  ui={COMMON_LAYOUT.CONTAINER}
                  className="h-full bg-yellow-400"
                  style={{ width: `${calculateRatingPercentage(ratingDistribution, stars)}%` }}
                />
              </UiDiv>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="w-12 text-right text-sm text-muted-foreground">
                {
                  ratingDistribution[stars === 5 ? 'five' : stars === 4 ? 'four' : stars === 3 ? 'three' : stars === 2 ? 'two' : 'one'].toLocaleString()
                }
              </UiLabel>
            </UiDiv>
          ))}
        </UiDiv>
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-px bg-gray-200" />

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="divide-y">
        {reviews.map((review) => (
          <UiDiv key={review.id} ui={COMMON_LAYOUT.CONTAINER} className="space-y-3 p-4 sm:p-5 transition-colors hover:bg-muted/50">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start gap-3">
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-10 w-10 rounded-full overflow-hidden relative">
                <UiImage
                  ui={COMMON_MEDIA.IMG}
                  src={review.customer.avatar}
                  alt={review.customer.name}
                  fill
                  className="object-cover"
                />
              </UiDiv>

              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1 min-w-0">
                <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-wrap items-center gap-2">
                  <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium text-sm">{review.customer.name}</UiLabel>
                  <StarRating rating={review.rating} />
                  <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</UiLabel>
                </UiDiv>
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-xs text-muted-foreground mt-0.5">{t(MERCHANT.MERCHANT_PROFILE.REVIEWS.PURCHASED)}: {review.productName}</UiLabel>
              </UiDiv>
            </UiDiv>

            <UiP ui={COMMON_TYPOGRAPHY.P} className="text-sm leading-relaxed pl-0 sm:pl-13">{review.comment}</UiP>

            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-4 pl-0 sm:pl-13">
              <UiButton ui={COMMON_FORMS.BUTTON} variant="ghost" size="sm" className="gap-1.5 h-8 text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" />
                <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-xs">{t(MERCHANT.MERCHANT_PROFILE.REVIEWS.HELPFUL)} ({review.helpful})</UiSpan>
              </UiButton>
            </UiDiv>
          </UiDiv>
        ))}
      </UiDiv>
    </UiCard>
  );
}

export default CustomerReviews;
