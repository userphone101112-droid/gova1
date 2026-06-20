'use client';
import { Upload } from 'lucide-react';

import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


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
    <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_TITLE_CONTAINER_L23.uuid} className="w-full">
      <h1 data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.IDENTITY_VERIFICATION.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.IDENTITY_VERIFICATION.DESCRIPTION)}</p>

      <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_FIRST_NAME_LABEL_CONTAINER_L27.uuid} className="space-y-6 max-w-4xl mx-auto">
        <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_FIRST_NAME_LABEL_CONTAINER_L28.uuid} className="grid gap-6 sm:grid-cols-2">
          <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_FIRST_NAME_LABEL_CONTAINER_L29.uuid} className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.FIRST_NAME_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.FIRST_NAME_LABEL)}</span>
            <input data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.FIRST_NAME_INPUT.uuid} value={identityVerification.firstName || ''} onChange={(e) => updateIdentityVerification({ firstName: e.target.value })} />
          </div>
          <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_LAST_NAME_LABEL_CONTAINER_L33.uuid} className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.LAST_NAME_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.LAST_NAME_LABEL)}</span>
            <input data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.LAST_NAME_INPUT.uuid} value={identityVerification.lastName || ''} onChange={(e) => updateIdentityVerification({ lastName: e.target.value })} />
          </div>
        </div>

        <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_DATE_OF_BIRTH_LABEL_CONTAINER_L39.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.DATE_OF_BIRTH_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.DATE_OF_BIRTH_LABEL)}</span>
          <input data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.DATE_OF_BIRTH_INPUT.uuid} type="date" value={identityVerification.dateOfBirth || ''} onChange={(e) => updateIdentityVerification({ dateOfBirth: e.target.value })} />
        </div>

        <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_EMAIL_LABEL_CONTAINER_L44.uuid} className="grid gap-6 sm:grid-cols-2">
          <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_EMAIL_LABEL_CONTAINER_L45.uuid} className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.EMAIL_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.EMAIL_LABEL)}</span>
            <input data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.EMAIL_INPUT.uuid} type="email" value={identityVerification.email || ''} onChange={(e) => updateIdentityVerification({ email: e.target.value })} />
          </div>
          <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_PHONE_LABEL_CONTAINER_L49.uuid} className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.PHONE_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.PHONE_LABEL)}</span>
            <input data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.PHONE_INPUT.uuid} value={identityVerification.phone || ''} onChange={(e) => updateIdentityVerification({ phone: e.target.value })} />
          </div>
        </div>

        <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_ID_TYPE_LABEL_CONTAINER_L55.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_LABEL)}</span>
          <select data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_SELECT.uuid} value={identityVerification.idType || ''} onChange={(e) => updateIdentityVerification({ idType: e.target.value as any })}>
            {idTypes.map((t) => (
              <option data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_OPTION.uuid} data-ui-instance-id={t.id} key={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_ID_NUMBER_LABEL_CONTAINER_L64.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.ID_NUMBER_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.ID_NUMBER_LABEL)}</span>
          <input data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.ID_NUMBER_INPUT.uuid} value={identityVerification.idNumber || ''} onChange={(e) => updateIdentityVerification({ idNumber: e.target.value })} />
        </div>

        <div data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_CARD.uuid} className="p-6">
          <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_UPLOAD_ID_LABEL_CONTAINER_L70.uuid} className="flex flex-col items-center justify-center gap-3 py-6 border-2 border-dashed rounded-lg border-outline-variant">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div data-ui-uuid={ONBOARDING.SHELL.IDENTITY_VERIFICATION_UPLOAD_ID_LABEL_CONTAINER_L72.uuid} className="text-center">
              <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_LABEL.uuid} className="font-medium">{t(ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_LABEL)}</span>
              <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_SUBTITLE.uuid} className="text-sm text-muted-foreground">{t(ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_SUBTITLE)}</span>
            </div>
            <button data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_BUTTON.uuid} onClick={() => updateIdentityVerification({ hasUploadedId: true })}>
              {t(ONBOARDING.IDENTITY_VERIFICATION.CHOOSE_FILE_BUTTON)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
