'use client';
import { Package } from 'lucide-react';

import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


export function ProductsStep() {
  const {
    data: { products },
    updateProducts,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.PRODUCTS.TITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PRODUCTS.TITLE.uuid}`} className="text-3xl font-bold tracking-tight mb-2">{t('onboarding.products.title')}</h1>
      <p data-ui-uuid={ONBOARDING.PRODUCTS.DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PRODUCTS.DESCRIPTION.uuid}`} className="text-muted-foreground mb-8">{t('onboarding.products.description')}</p>

      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <span data-ui-uuid={ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_LABEL.uuid}`} className="font-medium">{t('onboarding.products.digitalProducts')}</span>
              <span data-ui-uuid={ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_SUBTITLE.uuid}`} className="text-sm text-muted-foreground">{t('onboarding.products.digitalProductsSubtitle')}</span>
            </div>
            <input type="checkbox" checked={products.isDigital || false} onChange={(e) => updateProducts({ isDigital: e.target.checked })} />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <span data-ui-uuid={ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_LABEL.uuid}`} className="font-medium">{t('onboarding.products.physicalProducts')}</span>
              <span data-ui-uuid={ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_SUBTITLE.uuid}`} className="text-sm text-muted-foreground">{t('onboarding.products.physicalProductsSubtitle')}</span>
            </div>
            <input type="checkbox" checked={products.isPhysical || false} onChange={(e) => updateProducts({ isPhysical: e.target.checked })} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 py-8 sm:py-12 px-4 border-2 border-dashed rounded-lg border-outline-variant">
          <p className="text-muted-foreground">{t('onboarding.products.productCatalog')}</p>
          <button>{t('onboarding.products.addProductsLater')}</button>
        </div>
      </div>
    </div>
  );
}
