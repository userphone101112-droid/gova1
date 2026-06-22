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
    <section className={className}>
      {/* Banner Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden rounded-b-2xl">
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 1 }} />
        <Image src={merchant.banner} alt={`${merchant.name} ${t('merchant.hero.bannerAltSuffix')}`} fill className={`object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} onLoad={() => setImageLoaded(true)} />
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
      </div>

      {/* Merchant Info Section */}
      <div className="container relative -mt-20 px-4 sm:px-6 lg:-mt-24">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:gap-8">
          {/* Logo/Avatar */}
          <div className="relative">
            <div className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-xl rounded-full overflow-hidden">
              <Image src={merchant.logo} alt={merchant.name} fill className="object-cover" />
            </div>
            {/* Status Indicator */}
            <div className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-background ${getMerchantStatusColor(merchant.status).replace('text-', 'bg-')}`} aria-label={`${t('merchant.hero.statusLabel')} ${merchant.status}`} />
          </div>

          {/* Merchant Details */}
          <div className="flex-1 space-y-3 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {merchant.name}
              </h1>
              {merchant.verified && (
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.VERIFIED_BADGE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.HERO.VERIFIED_BADGE.uuid}`} className="gap-1.5 bg-warning-container text-on-warning-container border-warning">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t('merchant.hero.verifiedBadge')}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-normal">{merchant.category}</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{merchant.location.city}, {merchant.location.country}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{t('merchant.hero.joined')} {formatDate(merchant.joinedDate)}</span>
              </div>
            </div>

            {/* Social Metrics */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{formatCompactNumber(merchant.social.followers)}</span>
                <span className="text-sm text-muted-foreground">{t('merchant.hero.followers')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{formatCompactNumber(merchant.social.following)}</span>
                <span className="text-sm text-muted-foreground">{t('merchant.hero.following')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-4">
            <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.FOLLOW_BUTTON.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.HERO.FOLLOW_BUTTON.uuid}`} className="gap-2">
              <Users className="h-4 w-4" />
              {t('merchant.hero.followButton')}
            </button>
            <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.HERO.MESSAGE_BUTTON.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.HERO.MESSAGE_BUTTON.uuid}`}>
              {t('merchant.hero.messageButton')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MerchantHero;
