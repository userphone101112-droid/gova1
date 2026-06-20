'use client';

import { UiDiv, UiH1, UiP, UiInput, UiLabel, UiSelect, UiOption, COMMON_LAYOUT, COMMON_FORMS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';

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
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.BUSINESS_DETAILS.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.BUSINESS_DETAILS.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.BUSINESS_DETAILS.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.BUSINESS_DETAILS.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6 max-w-4xl mx-auto">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.BUSINESS_DETAILS.BUSINESS_NAME_LABEL}>{t(ONBOARDING.BUSINESS_DETAILS.BUSINESS_NAME_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            placeholder={t(ONBOARDING.BUSINESS_DETAILS.BUSINESS_NAME_PLACEHOLDER)}
            value={businessDetails.businessName || ''}
            onChange={(e) => updateBusinessDetails({ businessName: e.target.value })}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.BUSINESS_DETAILS.BUSINESS_TYPE_LABEL}>{t(ONBOARDING.BUSINESS_DETAILS.BUSINESS_TYPE_LABEL)}</UiLabel>
          <UiSelect
            ui={COMMON_FORMS.SELECT}
            value={businessDetails.businessType || ''}
            onChange={(e) => updateBusinessDetails({ businessType: e.target.value as any })}
          >
            {businessTypes.map((t) => (
              <UiOption key={t.id} ui={COMMON_FORMS.OPTION}>{t.label}</UiOption>
            ))}
          </UiSelect>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid gap-6 sm:grid-cols-2">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
            <UiLabel ui={ONBOARDING.BUSINESS_DETAILS.REGISTRATION_NUMBER_LABEL}>{t(ONBOARDING.BUSINESS_DETAILS.REGISTRATION_NUMBER_LABEL)}</UiLabel>
            <UiInput
              ui={COMMON_FORMS.INPUT}
              placeholder={t(ONBOARDING.BUSINESS_DETAILS.REGISTRATION_NUMBER_PLACEHOLDER)}
              value={businessDetails.businessRegistrationNumber || ''}
              onChange={(e) => updateBusinessDetails({ businessRegistrationNumber: e.target.value })}
            />
          </UiDiv>
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
            <UiLabel ui={ONBOARDING.BUSINESS_DETAILS.YEAR_FOUNDED_LABEL}>{t(ONBOARDING.BUSINESS_DETAILS.YEAR_FOUNDED_LABEL)}</UiLabel>
            <UiInput
              ui={COMMON_FORMS.INPUT}
              placeholder={t(ONBOARDING.BUSINESS_DETAILS.YEAR_FOUNDED_PLACEHOLDER)}
              value={businessDetails.yearFounded || ''}
              onChange={(e) => updateBusinessDetails({ yearFounded: e.target.value })}
            />
          </UiDiv>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.BUSINESS_DETAILS.EMPLOYEE_COUNT_LABEL}>{t(ONBOARDING.BUSINESS_DETAILS.EMPLOYEE_COUNT_LABEL)}</UiLabel>
          <UiSelect
            ui={COMMON_FORMS.SELECT}
            value={businessDetails.employeeCount || ''}
            onChange={(e) => updateBusinessDetails({ employeeCount: e.target.value })}
          >
            {employeeCountOptions.map((e) => (
              <UiOption key={e.id} ui={COMMON_FORMS.OPTION}>{e.label}</UiOption>
            ))}
          </UiSelect>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
