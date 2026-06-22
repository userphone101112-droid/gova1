'use client';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


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
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.STORE_INFO.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.STORE_INFO.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.STORE_INFO.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.STORE_INFO.DESCRIPTION)}</p>

      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.STORE_INFO.STORE_NAME_LABEL.uuid}>{t(ONBOARDING.STORE_INFO.STORE_NAME_LABEL)}</span>
          <input placeholder={t(ONBOARDING.STORE_INFO.STORE_NAME_PLACEHOLDER)} value={storeInfo.storeName || ''} onChange={(e) => updateStoreInfo({ storeName: e.target.value })} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.STORE_INFO.STORE_URL_LABEL.uuid}>{t(ONBOARDING.STORE_INFO.STORE_URL_LABEL)}</span>
          <input placeholder={t(ONBOARDING.STORE_INFO.STORE_URL_PLACEHOLDER)} value={storeInfo.storeUrl || ''} onChange={(e) => updateStoreInfo({ storeUrl: e.target.value })} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.STORE_INFO.STORE_CATEGORY_LABEL.uuid}>{t(ONBOARDING.STORE_INFO.STORE_CATEGORY_LABEL)}</span>
          <select value={storeInfo.storeCategory || ''} onChange={(e) => updateStoreInfo({ storeCategory: e.target.value })}>
            {categories.map((cat) => (
              <option data-ui-instance-id={cat.id || "placeholder"} key={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.STORE_INFO.STORE_DESCRIPTION_LABEL.uuid}>{t(ONBOARDING.STORE_INFO.STORE_DESCRIPTION_LABEL)}</span>
          <textarea placeholder={t(ONBOARDING.STORE_INFO.STORE_DESCRIPTION_PLACEHOLDER)} value={storeInfo.storeDescription || ''} onChange={(e) => updateStoreInfo({ storeDescription: e.target.value })} rows={4} />
        </div>
      </div>
    </div>
  );
}
