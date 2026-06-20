'use client';

import { UiDiv, UiH1, UiP, UiInput, UiLabel, UiSelect, UiOption, UiButton, UiCard, COMMON_LAYOUT, COMMON_TYPOGRAPHY, COMMON_FORMS, COMMON_COMPONENTS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { Upload } from 'lucide-react';

export function IdentityVerificationStep() {
  const {
    data: { identityVerification },
    updateIdentityVerification,
  } = useOnboardingStore();
  const { t } = useTranslation();

  const idTypes = [
    { id: '', label: t(ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_PLACEHOLDER) },
    { id: 'passport', label: t(ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_PASSPORT) },
    { id: 'driver-license', label: t(ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_DRIVER_LICENSE) },
    { id: 'national-id', label: t(ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_NATIONAL_ID) },
  ];

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.IDENTITY_VERIFICATION.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.IDENTITY_VERIFICATION.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.IDENTITY_VERIFICATION.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.IDENTITY_VERIFICATION.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6 max-w-4xl mx-auto">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid gap-6 sm:grid-cols-2">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
            <UiLabel ui={ONBOARDING.IDENTITY_VERIFICATION.FIRST_NAME_LABEL}>{t(ONBOARDING.IDENTITY_VERIFICATION.FIRST_NAME_LABEL)}</UiLabel>
            <UiInput
              ui={COMMON_FORMS.INPUT}
              value={identityVerification.firstName || ''}
              onChange={(e) => updateIdentityVerification({ firstName: e.target.value })}
            />
          </UiDiv>
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
            <UiLabel ui={ONBOARDING.IDENTITY_VERIFICATION.LAST_NAME_LABEL}>{t(ONBOARDING.IDENTITY_VERIFICATION.LAST_NAME_LABEL)}</UiLabel>
            <UiInput
              ui={COMMON_FORMS.INPUT}
              value={identityVerification.lastName || ''}
              onChange={(e) => updateIdentityVerification({ lastName: e.target.value })}
            />
          </UiDiv>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.IDENTITY_VERIFICATION.DATE_OF_BIRTH_LABEL}>{t(ONBOARDING.IDENTITY_VERIFICATION.DATE_OF_BIRTH_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            type="date"
            value={identityVerification.dateOfBirth || ''}
            onChange={(e) => updateIdentityVerification({ dateOfBirth: e.target.value })}
          />
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid gap-6 sm:grid-cols-2">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
            <UiLabel ui={ONBOARDING.IDENTITY_VERIFICATION.EMAIL_LABEL}>{t(ONBOARDING.IDENTITY_VERIFICATION.EMAIL_LABEL)}</UiLabel>
            <UiInput
              ui={COMMON_FORMS.INPUT}
              type="email"
              value={identityVerification.email || ''}
              onChange={(e) => updateIdentityVerification({ email: e.target.value })}
            />
          </UiDiv>
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
            <UiLabel ui={ONBOARDING.IDENTITY_VERIFICATION.PHONE_LABEL}>{t(ONBOARDING.IDENTITY_VERIFICATION.PHONE_LABEL)}</UiLabel>
            <UiInput
              ui={COMMON_FORMS.INPUT}
              value={identityVerification.phone || ''}
              onChange={(e) => updateIdentityVerification({ phone: e.target.value })}
            />
          </UiDiv>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_LABEL}>{t(ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_LABEL)}</UiLabel>
          <UiSelect
            ui={COMMON_FORMS.SELECT}
            value={identityVerification.idType || ''}
            onChange={(e) => updateIdentityVerification({ idType: e.target.value as any })}
          >
            {idTypes.map((t) => (
              <UiOption key={t.id} ui={COMMON_FORMS.OPTION}>{t.label}</UiOption>
            ))}
          </UiSelect>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={ONBOARDING.IDENTITY_VERIFICATION.ID_NUMBER_LABEL}>{t(ONBOARDING.IDENTITY_VERIFICATION.ID_NUMBER_LABEL)}</UiLabel>
          <UiInput
            ui={COMMON_FORMS.INPUT}
            value={identityVerification.idNumber || ''}
            onChange={(e) => updateIdentityVerification({ idNumber: e.target.value })}
          />
        </UiDiv>

        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="p-6">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-col items-center justify-center gap-3 py-6 border-2 border-dashed rounded-lg border-gray-300">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="text-center">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{t(ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_LABEL)}</UiLabel>
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_SUBTITLE)}</UiLabel>
            </UiDiv>
            <UiButton
              ui={COMMON_FORMS.BUTTON}
              variant="ghost"
              onClick={() => updateIdentityVerification({ hasUploadedId: true })}
            >
              {t(ONBOARDING.IDENTITY_VERIFICATION.CHOOSE_FILE_BUTTON)}
            </UiButton>
          </UiDiv>
        </UiCard>
      </UiDiv>
    </UiDiv>
  );
}
