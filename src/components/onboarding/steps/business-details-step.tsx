'use client';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


export function BusinessDetailsStep() {
  const {
    data: { businessDetails },
    updateBusinessDetails,
  } = useOnboardingStore();
  const { t } = useTranslation();

  const businessTypes = [
    { id: '', label: t('onboarding.business-details.businessTypePlaceholder') },
    { id: 'sole-proprietorship', label: t('onboarding.business-details.typeSoleProprietorship') },
    { id: 'llc', label: t('onboarding.business-details.typeLlc') },
    { id: 'corporation', label: t('onboarding.business-details.typeCorporation') },
    { id: 'partnership', label: t('onboarding.business-details.typePartnership') },
    { id: 'other', label: t('onboarding.business-details.typeOther') },
  ];

  const employeeCountOptions = [
    { id: '', label: t('onboarding.business-details.employeeCountPlaceholder') },
    { id: '1', label: '1' },
    { id: '2-10', label: '2-10' },
    { id: '11-50', label: '11-50' },
    { id: '51-200', label: '51-200' },
    { id: '200+', label: '200+' },
  ];

  return (
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.TITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BUSINESS_DETAILS.TITLE.uuid}`} className="text-3xl font-bold tracking-tight mb-2">{t('onboarding.business-details.title')}</h1>
      <p data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BUSINESS_DETAILS.DESCRIPTION.uuid}`} className="text-muted-foreground mb-8">{t('onboarding.business-details.description')}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.BUSINESS_NAME_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BUSINESS_DETAILS.BUSINESS_NAME_LABEL.uuid}`}>{t('onboarding.business-details.businessName')}</span>
          <input placeholder={t('onboarding.business-details.businessNamePlaceholder')} value={businessDetails.businessName || ''} onChange={(e) => updateBusinessDetails({ businessName: e.target.value })} />
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.BUSINESS_TYPE_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BUSINESS_DETAILS.BUSINESS_TYPE_LABEL.uuid}`}>{t('onboarding.business-details.businessType')}</span>
          <select value={businessDetails.businessType || ''} onChange={(e) => updateBusinessDetails({ businessType: e.target.value as any })}>
            {businessTypes.map((t) => (
              <option data-ui-instance-id={t.id} key={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.REGISTRATION_NUMBER_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BUSINESS_DETAILS.REGISTRATION_NUMBER_LABEL.uuid}`}>{t('onboarding.business-details.registrationNumber')}</span>
            <input placeholder={t('onboarding.business-details.registrationNumberPlaceholder')} value={businessDetails.businessRegistrationNumber || ''} onChange={(e) => updateBusinessDetails({ businessRegistrationNumber: e.target.value })} />
          </div>
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.YEAR_FOUNDED_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BUSINESS_DETAILS.YEAR_FOUNDED_LABEL.uuid}`}>{t('onboarding.business-details.yearFounded')}</span>
            <input placeholder={t('onboarding.business-details.yearFoundedPlaceholder')} value={businessDetails.yearFounded || ''} onChange={(e) => updateBusinessDetails({ yearFounded: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.EMPLOYEE_COUNT_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.BUSINESS_DETAILS.EMPLOYEE_COUNT_LABEL.uuid}`}>{t('onboarding.business-details.employeeCount')}</span>
          <select value={businessDetails.employeeCount || ''} onChange={(e) => updateBusinessDetails({ employeeCount: e.target.value })}>
            {employeeCountOptions.map((e) => (
              <option data-ui-instance-id={e.id} key={e.id}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
