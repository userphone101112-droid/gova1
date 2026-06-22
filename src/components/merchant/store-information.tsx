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
    <div className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-full bg-muted p-2">
            <Store className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.STORE_INFO.TITLE.uuid} className="text-lg">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.TITLE)}</h4>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.ABOUT)}</h4>
            <p className="text-sm leading-relaxed">{displayAbout}</p>
            {shouldTruncate && (
              <button className="gap-1 h-8 px-0 text-primary" onClick={() => setExpanded(!expanded)}>
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

          <div className="h-px bg-outline-variant" />

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.CATEGORIES)}</h4>
            <div className="flex flex-wrap gap-2">
              {store.categories.map((category) => (
                <span data-ui-instance-id={category} key={category} className="font-normal">
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-outline-variant" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium text-sm">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.SHIPPING_COVERAGE)}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {store.shippingCoverage.slice(0, 4).map((country) => (
                  <span data-ui-instance-id={country} key={country} className="font-normal text-xs">
                    {country}
                  </span>
                ))}
                {store.shippingCoverage.length > 4 && (
                  <span className="font-normal text-xs">
                    +{store.shippingCoverage.length - 4} {t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.MORE)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium text-sm">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.RETURN_POLICY)}</h4>
              </div>
              <span className="text-sm text-muted-foreground">{store.returnPolicy}</span>
            </div>
          </div>

          <div className="h-px bg-outline-variant" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-warning" />
              <h4 className="font-medium text-sm">{t(MERCHANT.MERCHANT_PROFILE.STORE_INFO.STORE_SPECIALTIES)}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {store.specialties.map((specialty) => (
                <span data-ui-instance-id={specialty} key={specialty} className="bg-warning-container text-on-warning-container border-warning font-normal">
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
