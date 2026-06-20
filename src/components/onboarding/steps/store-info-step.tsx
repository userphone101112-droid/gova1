'use client';

import { UiDiv, UiH1, UiP, UiInput, UiLabel, UiTextarea, UiSelect, UiOption, COMMON_LAYOUT, COMMON_FORMS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';

export function StoreInfoStep() {
  const {
    data: { storeInfo },
    updateStoreInfo,
  } = useOnboardingStore();
  const { t } = useTranslation();

  const categories = [
    { id: '', label: t(ONBOARDING.STORE_INFO.STORE_CATEGORY_PLACEHOLDER) },
    { id: 'fashion', label: t(ONBOARDING.STORE_INFO.STORE_CATEGORY_FASHION) },
    { id: 'electronics', label: t(ONBOARDING.STORE_INFO.STORE_CATEGORY_ELECTRONICS) },
    { id: 'home', label: t(ONBOARDING.STORE_INFO.STORE_CATEGORY_HOME) },
    { id: 'beauty', label: t(ONBOARDING.STORE_INFO.STORE_CATEGORY_BEAUTY) },
    { id: 'sports', label: t(ONBOARDING.STORE_INFO.STORE_CATEGORY_SPORTS) },
    { id: 'other', label: t(ONBOARDING.STORE_INFO.STORE_CATEGORY_OTHER) },
  ];

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.STORE_INFO.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.STORE_INFO.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.STORE_INFO.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.STORE_INFO.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.STORE_INFO.STORE_NAME_LABEL}>{t(ONBOARDING.STORE_INFO.STORE_NAME_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            placeholder={t(ONBOARDING.STORE_INFO.STORE_NAME_PLACEHOLDER)}
            value={storeInfo.storeName || ''}
            onChange={(e) => updateStoreInfo({ storeName: e.target.value })}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.STORE_INFO.STORE_URL_LABEL}>{t(ONBOARDING.STORE_INFO.STORE_URL_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            placeholder={t(ONBOARDING.STORE_INFO.STORE_URL_PLACEHOLDER)}
            value={storeInfo.storeUrl || ''}
            onChange={(e) => updateStoreInfo({ storeUrl: e.target.value })}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.STORE_INFO.STORE_CATEGORY_LABEL}>{t(ONBOARDING.STORE_INFO.STORE_CATEGORY_LABEL)}</UiLabel>
          <UiSelect
            ui={COMMON_FORMS.SELECT}
            value={storeInfo.storeCategory || ''}
            onChange={(e) => updateStoreInfo({ storeCategory: e.target.value })}
          >
            {categories.map((cat) => (
              <UiOption key={cat.id} ui={COMMON_FORMS.OPTION}>{cat.label}</UiOption>
            ))}
          </UiSelect>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.STORE_INFO.STORE_DESCRIPTION_LABEL}>{t(ONBOARDING.STORE_INFO.STORE_DESCRIPTION_LABEL)}</UiLabel>
          <UiTextarea
            ui={COMMON_FORMS.TEXTAREA}
            placeholder={t(ONBOARDING.STORE_INFO.STORE_DESCRIPTION_PLACEHOLDER)}
            value={storeInfo.storeDescription || ''}
            onChange={(e) => updateStoreInfo({ storeDescription: e.target.value })}
            rows={4}
          />
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
