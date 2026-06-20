'use client';
import { MapPin, Calendar, CheckCircle2, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import type { Merchant } from '@/lib/merchant/types';
import { formatCompactNumber, formatDate, getMerchantStatusColor } from '@/lib/merchant/utils';
import { MERCHANT, useTranslation } from '@/platform/ui';


interface MerchantHeroProps {
  merchant: Merchant;
  className?: string;
}

export function MerchantHero({ merchant, className }: MerchantHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t } = useTranslation();

  return (
    <section data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.CONTAINER.uuid} className={className}>
      {/* Banner Image */}
      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L23.uuid} className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden rounded-b-2xl">
        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L24.uuid} className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 1 }} />
        <Image data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.BANNER_IMAGE.uuid} src={merchant.banner} alt={`${merchant.name} ${t(MERCHANT.MERCHANT_PROFILE.HERO.BANNER_ALT_SUFFIX)}`} fill className={`object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} onLoad={() => setImageLoaded(true)} />
        {!imageLoaded && (
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L27.uuid} className="absolute inset-0 animate-pulse bg-muted" />
        )}
      </div>

      {/* Merchant Info Section */}
      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L32.uuid} className="container relative -mt-20 px-4 sm:px-6 lg:-mt-24">
        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L33.uuid} className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:gap-8">
          {/* Logo/Avatar */}
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L35.uuid} className="relative">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L36.uuid} className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-xl rounded-full overflow-hidden">
              <Image data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.LOGO_IMAGE.uuid} src={merchant.logo} alt={merchant.name} fill className="object-cover" />
            </div>
            {/* Status Indicator */}
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L40.uuid} className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-background ${getMerchantStatusColor(merchant.status).replace('text-', 'bg-')}`} aria-label={`${t(MERCHANT.MERCHANT_PROFILE.HERO.STATUS_LABEL)} ${merchant.status}`} />
          </div>

          {/* Merchant Details */}
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L44.uuid} className="flex-1 space-y-3 pb-4">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_VERIFIED_BADGE_CONTAINER_L45.uuid} className="flex flex-wrap items-center gap-3">
              <h1 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.MERCHANT_NAME.uuid} className="text-3xl font-bold tracking-tight sm:text-4xl">
                {merchant.name}
              </h1>
              {merchant.verified && (
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.VERIFIED_BADGE.uuid} className="gap-1.5 bg-warning-container text-on-warning-container border-warning">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t(MERCHANT.MERCHANT_PROFILE.HERO.VERIFIED_BADGE)}
                </span>
              )}
            </div>

            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_JOINED_CONTAINER_L57.uuid} className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.CATEGORY_BADGE.uuid} className="font-normal">{merchant.category}</span>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_JOINED_CONTAINER_L59.uuid} className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_JOINED_SPAN_L61.uuid}>{merchant.location.city}, {merchant.location.country}</span>
              </div>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_JOINED_CONTAINER_L63.uuid} className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_JOINED_SPAN_L65.uuid}>{t(MERCHANT.MERCHANT_PROFILE.HERO.JOINED)} {formatDate(merchant.joinedDate)}</span>
              </div>
            </div>

            {/* Social Metrics */}
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_FOLLOWERS_CONTAINER_L70.uuid} className="flex items-center gap-6 pt-2">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_FOLLOWERS_CONTAINER_L71.uuid} className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_FOLLOWERS_SPAN_L73.uuid} className="font-semibold">{formatCompactNumber(merchant.social.followers)}</span>
                <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_FOLLOWERS_SPAN_L74.uuid} className="text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.HERO.FOLLOWERS)}</span>
              </div>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_FOLLOWING_CONTAINER_L76.uuid} className="flex items-center gap-1.5">
                <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_FOLLOWING_SPAN_L77.uuid} className="font-semibold">{formatCompactNumber(merchant.social.following)}</span>
                <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_FOLLOWING_SPAN_L78.uuid} className="text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.HERO.FOLLOWING)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_HERO_FOLLOW_BUTTON_CONTAINER_L84.uuid} className="flex gap-3 pb-4">
            <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.FOLLOW_BUTTON.uuid} className="gap-2">
              <Users className="h-4 w-4" />
              {t(MERCHANT.MERCHANT_PROFILE.HERO.FOLLOW_BUTTON)}
            </button>
            <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.MESSAGE_BUTTON.uuid}>
              {t(MERCHANT.MERCHANT_PROFILE.HERO.MESSAGE_BUTTON)}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MerchantHero;
