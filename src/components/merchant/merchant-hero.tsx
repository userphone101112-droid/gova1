'use client';

import { useState } from 'react';
import {
  UiSection,
  UiDiv,
  UiImage,
  UiH1,
  UiButton,
  UiBadge,
  UiSpan,
  MERCHANT,
  COMMON_LAYOUT,
  COMMON_MEDIA,
  COMMON_TYPOGRAPHY,
  COMMON_COMPONENTS,
    useTranslation,
} from '@/platform/ui';
import type { Merchant } from '@/lib/merchant/types';
import { formatCompactNumber, formatDate, getMerchantStatusColor } from '@/lib/merchant/utils';
import { MapPin, Calendar, CheckCircle2, Users } from 'lucide-react';

interface MerchantHeroProps {
  merchant: Merchant;
  className?: string;
}

export function MerchantHero({ merchant, className }: MerchantHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t } = useTranslation();

  return (
    <UiSection ui={MERCHANT.MERCHANT_PROFILE.HERO.CONTAINER} className={className}>
      {/* Banner Image */}
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden rounded-b-2xl">
        <UiDiv
          ui={COMMON_LAYOUT.CONTAINER}
          className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ zIndex: 1 }}
        />
        <UiImage
          ui={COMMON_MEDIA.IMG}
          src={merchant.banner}
          alt={`${merchant.name} ${t(MERCHANT.MERCHANT_PROFILE.HERO.BANNER_ALT_SUFFIX)}`}
          fill
          className={`object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="absolute inset-0 animate-pulse bg-muted" />
        )}
      </UiDiv>

      {/* Merchant Info Section */}
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="container relative -mt-20 px-4 sm:px-6 lg:-mt-24">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:gap-8">
          {/* Logo/Avatar */}
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="relative">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-xl rounded-full overflow-hidden">
              <UiImage
                ui={COMMON_MEDIA.IMG}
                src={merchant.logo}
                alt={merchant.name}
                fill
                className="object-cover"
              />
            </UiDiv>
            {/* Status Indicator */}
            <UiDiv
              ui={COMMON_LAYOUT.CONTAINER}
              className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-background ${getMerchantStatusColor(merchant.status).replace('text-', 'bg-')}`}
              aria-label={`${t(MERCHANT.MERCHANT_PROFILE.HERO.STATUS_LABEL)} ${merchant.status}`}
            />
          </UiDiv>

          {/* Merchant Details */}
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1 space-y-3 pb-4">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-wrap items-center gap-3">
              <UiH1 ui={COMMON_TYPOGRAPHY.H1} className="text-3xl font-bold tracking-tight sm:text-4xl">
                {merchant.name}
              </UiH1>
              {merchant.verified && (
                <UiBadge ui={COMMON_COMPONENTS.BADGE.LABEL} className="gap-1.5 bg-yellow-100 text-yellow-800 border-yellow-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t(MERCHANT.MERCHANT_PROFILE.HERO.VERIFIED_BADGE)}
                </UiBadge>
              )}
            </UiDiv>

            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <UiBadge ui={COMMON_COMPONENTS.BADGE.LABEL} className="font-normal">{merchant.category}</UiBadge>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <UiSpan ui={COMMON_LAYOUT.SPAN}>{merchant.location.city}, {merchant.location.country}</UiSpan>
              </UiDiv>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <UiSpan ui={COMMON_LAYOUT.SPAN}>{t(MERCHANT.MERCHANT_PROFILE.HERO.JOINED)} {formatDate(merchant.joinedDate)}</UiSpan>
              </UiDiv>
            </UiDiv>

            {/* Social Metrics */}
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-6 pt-2">
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <UiSpan ui={COMMON_LAYOUT.SPAN} className="font-semibold">{formatCompactNumber(merchant.social.followers)}</UiSpan>
                <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.HERO.FOLLOWERS)}</UiSpan>
              </UiDiv>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-1.5">
                <UiSpan ui={COMMON_LAYOUT.SPAN} className="font-semibold">{formatCompactNumber(merchant.social.following)}</UiSpan>
                <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.HERO.FOLLOWING)}</UiSpan>
              </UiDiv>
            </UiDiv>
          </UiDiv>

          {/* Action Buttons */}
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex gap-3 pb-4">
            <UiButton ui={MERCHANT.MERCHANT_PROFILE.HERO.FOLLOW_BUTTON} className="gap-2">
              <Users className="h-4 w-4" />
              {t(MERCHANT.MERCHANT_PROFILE.HERO.FOLLOW_BUTTON)}
            </UiButton>
            <UiButton ui={MERCHANT.MERCHANT_PROFILE.HERO.MESSAGE_BUTTON} variant="outline" size="lg">
              {t(MERCHANT.MERCHANT_PROFILE.HERO.MESSAGE_BUTTON)}
            </UiButton>
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiSection>
  );
}

export default MerchantHero;
