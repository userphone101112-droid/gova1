'use client';

import { UiDiv, UiH1, UiP, UiCheckbox, UiLabel, UiCard, UiButton, COMMON_LAYOUT, COMMON_TYPOGRAPHY, COMMON_FORMS, COMMON_COMPONENTS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { Package } from 'lucide-react';

export function ProductsStep() {
  const {
    data: { products },
    updateProducts,
  } = useOnboardingStore();
  const { t } = useTranslation();

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.PRODUCTS.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.PRODUCTS.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.PRODUCTS.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.PRODUCTS.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="p-4 sm:p-6">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-primary/10 p-3">
              <Package className="h-6 w-6 text-primary" />
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{t(ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_LABEL)}</UiLabel>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(ONBOARDING.PRODUCTS.DIGITAL_PRODUCTS_SUBTITLE)}</UiLabel>
            </UiDiv>
            <UiCheckbox
              ui={COMMON_FORMS.CHECKBOX}
              checked={products.isDigital || false}
              onCheckedChange={(checked) => updateProducts({ isDigital: checked as boolean })}
            />
          </UiDiv>
        </UiCard>

        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="p-4 sm:p-6">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-primary/10 p-3">
              <Package className="h-6 w-6 text-primary" />
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{t(ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_LABEL)}</UiLabel>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(ONBOARDING.PRODUCTS.PHYSICAL_PRODUCTS_SUBTITLE)}</UiLabel>
            </UiDiv>
            <UiCheckbox
              ui={COMMON_FORMS.CHECKBOX}
              checked={products.isPhysical || false}
              onCheckedChange={(checked) => updateProducts({ isPhysical: checked as boolean })}
            />
          </UiDiv>
        </UiCard>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-col items-center justify-center gap-4 py-8 sm:py-12 px-4 border-2 border-dashed rounded-lg border-gray-300">
          <UiP ui={COMMON_TYPOGRAPHY.P} className="text-muted-foreground">{t(ONBOARDING.PRODUCTS.PRODUCT_CATALOG_LABEL)}</UiP>
          <UiButton ui={COMMON_FORMS.BUTTON} variant="ghost">{t(ONBOARDING.PRODUCTS.ADD_PRODUCTS_LATER_BUTTON)}</UiButton>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
