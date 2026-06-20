'use client';
import { Store, Truck, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import type { StoreInformation as StoreInformationType } from '@/lib/merchant/types';
import { MERCHANT, useTranslation } from '@/platform/ui';



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
    <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.CONTAINER.uuid} className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_TITLE_CONTAINER_L24.uuid} className="p-6">
        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_TITLE_CONTAINER_L25.uuid} className="flex items-center gap-2 mb-4">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_TITLE_CONTAINER_L26.uuid} className="rounded-full bg-muted p-2">
            <Store className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.TITLE.uuid} className="text-lg">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.TITLE)}</h4>
        </div>

        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_ABOUT_CONTAINER_L32.uuid} className="space-y-6">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_ABOUT_CONTAINER_L33.uuid} className="space-y-2">
            <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.ABOUT_HEADING.uuid} className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.ABOUT)}</h4>
            <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.ABOUT_TEXT.uuid} className="text-sm leading-relaxed">{displayAbout}</p>
            {shouldTruncate && (
              <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.EXPAND_BUTTON.uuid} className="gap-1 h-8 px-0 text-primary" onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <>
                    {t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.SHOW_LESS)} <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    {t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.SHOW_MORE)} <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_ABOUT_CONTAINER_L51.uuid} className="h-px bg-outline-variant" />

          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_CATEGORIES_CONTAINER_L53.uuid} className="space-y-3">
            <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.CATEGORIES_HEADING.uuid} className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.CATEGORIES)}</h4>
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_CATEGORIES_CONTAINER_L55.uuid} className="flex flex-wrap gap-2">
              {store.categories.map((category) => (
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.CATEGORY_BADGE.uuid} data-ui-instance-id={category} key={category} className="font-normal">
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_ABOUT_CONTAINER_L64.uuid} className="h-px bg-outline-variant" />

          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_SHIPPING_COVERAGE_CONTAINER_L66.uuid} className="grid gap-4 sm:grid-cols-2">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_SHIPPING_COVERAGE_CONTAINER_L67.uuid} className="space-y-3">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_SHIPPING_COVERAGE_CONTAINER_L68.uuid} className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.SHIPPING_HEADING.uuid} className="font-medium text-sm">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.SHIPPING_COVERAGE)}</h4>
              </div>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_MORE_CONTAINER_L72.uuid} className="flex flex-wrap gap-1.5">
                {store.shippingCoverage.slice(0, 4).map((country) => (
                  <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.COUNTRY_BADGE.uuid} data-ui-instance-id={country} key={country} className="font-normal text-xs">
                    {country}
                  </span>
                ))}
                {store.shippingCoverage.length > 4 && (
                  <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.MORE_COUNTRIES_BADGE.uuid} className="font-normal text-xs">
                    +{store.shippingCoverage.length - 4} {t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.MORE)}
                  </span>
                )}
              </div>
            </div>

            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_RETURN_POLICY_CONTAINER_L86.uuid} className="space-y-3">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_RETURN_POLICY_CONTAINER_L87.uuid} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.RETURN_POLICY_HEADING.uuid} className="font-medium text-sm">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.RETURN_POLICY)}</h4>
              </div>
              <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.RETURN_POLICY_TEXT.uuid} className="text-sm text-muted-foreground">{store.returnPolicy}</span>
            </div>
          </div>

          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_ABOUT_CONTAINER_L95.uuid} className="h-px bg-outline-variant" />

          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_STORE_SPECIALTIES_CONTAINER_L97.uuid} className="space-y-3">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_STORE_SPECIALTIES_CONTAINER_L98.uuid} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-warning" />
              <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.SPECIALTIES_HEADING.uuid} className="font-medium text-sm">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.STORE_SPECIALTIES)}</h4>
            </div>
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_STORE_INFO_STORE_SPECIALTIES_CONTAINER_L102.uuid} className="flex flex-wrap gap-2">
              {store.specialties.map((specialty) => (
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.SPECIALTY_BADGE.uuid} data-ui-instance-id={specialty} key={specialty} className="bg-warning-container text-on-warning-container border-warning font-normal">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreInformation;
