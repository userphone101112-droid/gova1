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
    { id: '', label: t('onboarding.store-info.storeCategoryPlaceholder') },
    { id: 'fashion', label: t('onboarding.store-info.categoryFashion') },
    { id: 'electronics', label: t('onboarding.store-info.categoryElectronics') },
    { id: 'home', label: t('onboarding.store-info.categoryHome') },
    { id: 'beauty', label: t('onboarding.store-info.categoryBeauty') },
    { id: 'sports', label: t('onboarding.store-info.categorySports') },
    { id: 'other', label: t('onboarding.store-info.categoryOther') },
  ];

  return (
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.STORE_INFO.TITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.STORE_INFO.TITLE.uuid}`} className="text-3xl font-bold tracking-tight mb-2">{t('onboarding.store-info.title')}</h1>
      <p data-ui-uuid={ONBOARDING.STORE_INFO.DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.STORE_INFO.DESCRIPTION.uuid}`} className="text-muted-foreground mb-8">{t('onboarding.store-info.description')}</p>

      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.STORE_INFO.STORE_NAME_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.STORE_INFO.STORE_NAME_LABEL.uuid}`}>{t('onboarding.store-info.storeName')}</span>
          <input placeholder={t('onboarding.store-info.storeNamePlaceholder')} value={storeInfo.storeName || ''} onChange={(e) => updateStoreInfo({ storeName: e.target.value })} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.STORE_INFO.STORE_URL_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.STORE_INFO.STORE_URL_LABEL.uuid}`}>{t('onboarding.store-info.storeUrl')}</span>
          <input placeholder={t('onboarding.store-info.storeUrlPlaceholder')} value={storeInfo.storeUrl || ''} onChange={(e) => updateStoreInfo({ storeUrl: e.target.value })} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.STORE_INFO.STORE_CATEGORY_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.STORE_INFO.STORE_CATEGORY_LABEL.uuid}`}>{t('onboarding.store-info.storeCategory')}</span>
          <select value={storeInfo.storeCategory || ''} onChange={(e) => updateStoreInfo({ storeCategory: e.target.value })}>
            {categories.map((cat) => (
              <option data-ui-instance-id={cat.id || "placeholder"} key={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.STORE_INFO.STORE_DESCRIPTION_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.STORE_INFO.STORE_DESCRIPTION_LABEL.uuid}`}>{t('onboarding.store-info.storeDescription')}</span>
          <textarea placeholder={t('onboarding.store-info.storeDescriptionPlaceholder')} value={storeInfo.storeDescription || ''} onChange={(e) => updateStoreInfo({ storeDescription: e.target.value })} rows={4} />
        </div>
      </div>
    </div>
  );
}
