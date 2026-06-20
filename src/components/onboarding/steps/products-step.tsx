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
    <div data-ui-uuid={ONBOARDING.SHELL.PRODUCTS_TITLE_CONTAINER_L16.uuid} className="w-full">
      <h1 data-ui-uuid={ONBOARDING.PRODUCTS.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.PRODUCTS.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.PRODUCTS.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.PRODUCTS.DESCRIPTION)}</p>

      <div data-ui-uuid={ONBOARDING.SHELL.PRODUCTS_DIGITAL_PRODUCTS_LABEL_CONTAINER_L20.uuid} className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div data-ui-uuid={ONBOARDING.PRODUCTS.DIGITAL_CARD.uuid} className="p-4 sm:p-6">
          <div data-ui-uuid={ONBOARDING.SHELL.PRODUCTS_DIGITAL_PRODUCTS_LABEL_CONTAINER_L22.uuid} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div data-ui-uuid={ONBOARDING.SHELL.PRODUCTS_DIGITAL_PRODUCTS_LABEL_CONTAINER_L23.uuid} className="rounded-full bg-primary/10 p-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div data-ui-uuid={ONBOARDING.SHELL.PRODUCTS_DIGITAL_PRODUCTS_LABEL_CONTAINER_L26.uuid} className="flex-1">
              <span data-ui-uuid={ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_LABEL.uuid} className="font-medium">{t(ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_LABEL)}</span>
              <span data-ui-uuid={ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_SUBTITLE.uuid} className="text-sm text-muted-foreground">{t(ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_SUBTITLE)}</span>
            </div>
            <input type="checkbox" data-ui-uuid={ONBOARDING.PRODUCTS.DIGITAL_CHECKBOX.uuid} checked={products.isDigital || false} onChange={(e) => updateProducts({ isDigital: e.target.checked })} />
          </div>
        </div>

        <div data-ui-uuid={ONBOARDING.PRODUCTS.PHYSICAL_CARD.uuid} className="p-4 sm:p-6">
          <div data-ui-uuid={ONBOARDING.SHELL.PRODUCTS_PHYSICAL_PRODUCTS_LABEL_CONTAINER_L35.uuid} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div data-ui-uuid={ONBOARDING.SHELL.PRODUCTS_PHYSICAL_PRODUCTS_LABEL_CONTAINER_L36.uuid} className="rounded-full bg-primary/10 p-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div data-ui-uuid={ONBOARDING.SHELL.PRODUCTS_PHYSICAL_PRODUCTS_LABEL_CONTAINER_L39.uuid} className="flex-1">
              <span data-ui-uuid={ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_LABEL.uuid} className="font-medium">{t(ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_LABEL)}</span>
              <span data-ui-uuid={ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_SUBTITLE.uuid} className="text-sm text-muted-foreground">{t(ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_SUBTITLE)}</span>
            </div>
            <input type="checkbox" data-ui-uuid={ONBOARDING.PRODUCTS.PHYSICAL_CHECKBOX.uuid} checked={products.isPhysical || false} onChange={(e) => updateProducts({ isPhysical: e.target.checked })} />
          </div>
        </div>

        <div data-ui-uuid={ONBOARDING.SHELL.PRODUCTS_PRODUCT_CATALOG_LABEL_CONTAINER_L47.uuid} className="flex flex-col items-center justify-center gap-4 py-8 sm:py-12 px-4 border-2 border-dashed rounded-lg border-outline-variant">
          <p data-ui-uuid={ONBOARDING.PRODUCTS.CATALOG_TEXT.uuid} className="text-muted-foreground">{t(ONBOARDING.PRODUCTS.PRODUCT_CATALOG_LABEL)}</p>
          <button data-ui-uuid={ONBOARDING.PRODUCTS.ADD_LATER_BUTTON.uuid}>{t(ONBOARDING.PRODUCTS.ADD_PRODUCTS_LATER_BUTTON)}</button>
        </div>
      </div>
    </div>
  );
}
