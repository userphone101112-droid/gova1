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
    { id: '', label: t(ONBOARDING.BUSINESS_DETAILS.BUSINESS_TYPE_PLACEHOLDER) },
    { id: 'sole-proprietorship', label: t(ONBOARDING.BUSINESS_DETAILS.TYPE_SOLE_PROPRIETORSHIP) },
    { id: 'llc', label: t(ONBOARDING.BUSINESS_DETAILS.TYPE_LLC) },
    { id: 'corporation', label: t(ONBOARDING.BUSINESS_DETAILS.TYPE_CORPORATION) },
    { id: 'partnership', label: t(ONBOARDING.BUSINESS_DETAILS.TYPE_PARTNERSHIP) },
    { id: 'other', label: t(ONBOARDING.BUSINESS_DETAILS.TYPE_OTHER) },
  ];

  const employeeCountOptions = [
    { id: '', label: t(ONBOARDING.BUSINESS_DETAILS.EMPLOYEE_COUNT_PLACEHOLDER) },
    { id: '1', label: '1' },
    { id: '2-10', label: '2-10' },
    { id: '11-50', label: '11-50' },
    { id: '51-200', label: '51-200' },
    { id: '200+', label: '200+' },
  ];

  return (
    <div data-ui-uuid={ONBOARDING.SHELL.BUSINESS_DETAILS_TITLE_CONTAINER_L32.uuid} className="w-full">
      <h1 data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.BUSINESS_DETAILS.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.BUSINESS_DETAILS.DESCRIPTION)}</p>

      <div data-ui-uuid={ONBOARDING.SHELL.BUSINESS_DETAILS_BUSINESS_NAME_LABEL_CONTAINER_L36.uuid} className="space-y-6 max-w-4xl mx-auto">
        <div data-ui-uuid={ONBOARDING.SHELL.BUSINESS_DETAILS_BUSINESS_NAME_LABEL_CONTAINER_L37.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.BUSINESS_NAME_LABEL.uuid}>{t(ONBOARDING.BUSINESS_DETAILS.BUSINESS_NAME_LABEL)}</span>
          <input data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.BUSINESS_NAME_INPUT.uuid} placeholder={t(ONBOARDING.BUSINESS_DETAILS.BUSINESS_NAME_PLACEHOLDER)} value={businessDetails.businessName || ''} onChange={(e) => updateBusinessDetails({ businessName: e.target.value })} />
        </div>

        <div data-ui-uuid={ONBOARDING.SHELL.BUSINESS_DETAILS_BUSINESS_TYPE_LABEL_CONTAINER_L42.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.BUSINESS_TYPE_LABEL.uuid}>{t(ONBOARDING.BUSINESS_DETAILS.BUSINESS_TYPE_LABEL)}</span>
          <select data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.BUSINESS_TYPE_SELECT.uuid} value={businessDetails.businessType || ''} onChange={(e) => updateBusinessDetails({ businessType: e.target.value as any })}>
            {businessTypes.map((t) => (
              <option data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.BUSINESS_TYPE_OPTION.uuid} data-ui-instance-id={t.id} key={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div data-ui-uuid={ONBOARDING.SHELL.BUSINESS_DETAILS_REGISTRATION_NUMBER_LABEL_CONTAINER_L51.uuid} className="grid gap-6 sm:grid-cols-2">
          <div data-ui-uuid={ONBOARDING.SHELL.BUSINESS_DETAILS_REGISTRATION_NUMBER_LABEL_CONTAINER_L52.uuid} className="space-y-2">
            <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.REGISTRATION_NUMBER_LABEL.uuid}>{t(ONBOARDING.BUSINESS_DETAILS.REGISTRATION_NUMBER_LABEL)}</span>
            <input data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.REGISTRATION_NUMBER_INPUT.uuid} placeholder={t(ONBOARDING.BUSINESS_DETAILS.REGISTRATION_NUMBER_PLACEHOLDER)} value={businessDetails.businessRegistrationNumber || ''} onChange={(e) => updateBusinessDetails({ businessRegistrationNumber: e.target.value })} />
          </div>
          <div data-ui-uuid={ONBOARDING.SHELL.BUSINESS_DETAILS_YEAR_FOUNDED_LABEL_CONTAINER_L56.uuid} className="space-y-2">
            <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.YEAR_FOUNDED_LABEL.uuid}>{t(ONBOARDING.BUSINESS_DETAILS.YEAR_FOUNDED_LABEL)}</span>
            <input data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.YEAR_FOUNDED_INPUT.uuid} placeholder={t(ONBOARDING.BUSINESS_DETAILS.YEAR_FOUNDED_PLACEHOLDER)} value={businessDetails.yearFounded || ''} onChange={(e) => updateBusinessDetails({ yearFounded: e.target.value })} />
          </div>
        </div>

        <div data-ui-uuid={ONBOARDING.SHELL.BUSINESS_DETAILS_EMPLOYEE_COUNT_LABEL_CONTAINER_L62.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.EMPLOYEE_COUNT_LABEL.uuid}>{t(ONBOARDING.BUSINESS_DETAILS.EMPLOYEE_COUNT_LABEL)}</span>
          <select data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.EMPLOYEE_COUNT_SELECT.uuid} value={businessDetails.employeeCount || ''} onChange={(e) => updateBusinessDetails({ employeeCount: e.target.value })}>
            {employeeCountOptions.map((e) => (
              <option data-ui-uuid={ONBOARDING.BUSINESS_DETAILS.EMPLOYEE_COUNT_OPTION.uuid} data-ui-instance-id={e.id} key={e.id}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
