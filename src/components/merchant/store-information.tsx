'use client';

import { useState } from 'react';
import {
  UiCard,
  UiDiv,
  UiH4,
  UiP,
  UiButton,
  UiLabel,
  UiBadge,
  MERCHANT,
  COMMON_LAYOUT,
  COMMON_TYPOGRAPHY,
  COMMON_COMPONENTS,
  COMMON_FORMS,
  useTranslation,
} from '@/platform/ui';
import type { StoreInformation as StoreInformationType } from '@/lib/merchant/types';
import { Store, Truck, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface StoreInformationProps {
  store: StoreInformationType;
  className?: string;
}

export function StoreInformation({ store, className }: StoreInformationProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const MAX_PREVIEW_LENGTH = 150;
  const shouldTruncate = store.about.length > MAX_PREVIEW_LENGTH;
  const displayAbout = expanded || !shouldTruncate ? store.about : `${store.about.slice(0, MAX_PREVIEW_LENGTH)}...`;

  return (
    <UiCard ui={MERCHANT.MERCHANT_PROFILE.STORE_INFO.CONTAINER} className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-6">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2 mb-4">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-muted p-2">
            <Store className="h-5 w-5 text-muted-foreground" />
          </UiDiv>
          <UiH4 ui={MERCHANT.MERCHANT_PROFILE.STORE_INFO.TITLE} className="text-lg">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.TITLE)}</UiH4>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
            <UiH4 ui={COMMON_TYPOGRAPHY.H4} className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.ABOUT)}</UiH4>
            <UiP ui={COMMON_TYPOGRAPHY.P} className="text-sm leading-relaxed">{displayAbout}</UiP>
            {shouldTruncate && (
              <UiButton
                ui={COMMON_FORMS.BUTTON}
                variant="ghost"
                size="sm"
                className="gap-1 h-8 px-0 text-primary"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    {t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.SHOW_LESS)} <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.SHOW_MORE)} <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </UiButton>
            )}
          </UiDiv>

          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-px bg-gray-200" />

          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-3">
            <UiH4 ui={COMMON_TYPOGRAPHY.H4} className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.CATEGORIES)}</UiH4>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-wrap gap-2">
              {store.categories.map((category) => (
                <UiBadge key={category} ui={COMMON_COMPONENTS.BADGE.LABEL} variant="secondary" className="font-normal">
                  {category}
                </UiBadge>
              ))}
            </UiDiv>
          </UiDiv>

          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-px bg-gray-200" />

          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid gap-4 sm:grid-cols-2">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-3">
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <UiH4 ui={COMMON_TYPOGRAPHY.H4} className="font-medium text-sm">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.SHIPPING_COVERAGE)}</UiH4>
              </UiDiv>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-wrap gap-1.5">
                {store.shippingCoverage.slice(0, 4).map((country) => (
                  <UiBadge key={country} ui={COMMON_COMPONENTS.BADGE.LABEL} variant="outline" className="font-normal text-xs">
                    {country}
                  </UiBadge>
                ))}
                {store.shippingCoverage.length > 4 && (
                  <UiBadge ui={COMMON_COMPONENTS.BADGE.LABEL} variant="outline" className="font-normal text-xs">
                    +{store.shippingCoverage.length - 4} {t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.MORE)}
                  </UiBadge>
                )}
              </UiDiv>
            </UiDiv>

            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-3">
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <UiH4 ui={COMMON_TYPOGRAPHY.H4} className="font-medium text-sm">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.RETURN_POLICY)}</UiH4>
              </UiDiv>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{store.returnPolicy}</UiLabel>
            </UiDiv>
          </UiDiv>

          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-px bg-gray-200" />

          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-3">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <UiH4 ui={COMMON_TYPOGRAPHY.H4} className="font-medium text-sm">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.STORE_SPECIALTIES)}</UiH4>
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-wrap gap-2">
              {store.specialties.map((specialty) => (
                <UiBadge
                  key={specialty}
                  ui={COMMON_COMPONENTS.BADGE.LABEL}
                  className="bg-yellow-100 text-yellow-800 border-yellow-200 font-normal"
                >
                  {specialty}
                </UiBadge>
              ))}
            </UiDiv>
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiCard>
  );
}

export default StoreInformation;
