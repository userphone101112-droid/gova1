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
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.IDENTITY_VERIFICATION.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.IDENTITY_VERIFICATION.DESCRIPTION)}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.FIRST_NAME_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.FIRST_NAME_LABEL)}</span>
            <input value={identityVerification.firstName || ''} onChange={(e) => updateIdentityVerification({ firstName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.LAST_NAME_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.LAST_NAME_LABEL)}</span>
            <input value={identityVerification.lastName || ''} onChange={(e) => updateIdentityVerification({ lastName: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.DATE_OF_BIRTH_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.DATE_OF_BIRTH_LABEL)}</span>
          <input type="date" value={identityVerification.dateOfBirth || ''} onChange={(e) => updateIdentityVerification({ dateOfBirth: e.target.value })} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.EMAIL_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.EMAIL_LABEL)}</span>
            <input type="email" value={identityVerification.email || ''} onChange={(e) => updateIdentityVerification({ email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.PHONE_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.PHONE_LABEL)}</span>
            <input value={identityVerification.phone || ''} onChange={(e) => updateIdentityVerification({ phone: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_LABEL)}</span>
          <select value={identityVerification.idType || ''} onChange={(e) => updateIdentityVerification({ idType: e.target.value as any })}>
            {idTypes.map((t) => (
              <option data-ui-instance-id={t.id} key={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.ID_NUMBER_LABEL.uuid}>{t(ONBOARDING.IDENTITY_VERIFICATION.ID_NUMBER_LABEL)}</span>
          <input value={identityVerification.idNumber || ''} onChange={(e) => updateIdentityVerification({ idNumber: e.target.value })} />
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-6 border-2 border-dashed rounded-lg border-outline-variant">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_LABEL.uuid} className="font-medium">{t(ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_LABEL)}</span>
              <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_SUBTITLE.uuid} className="text-sm text-muted-foreground">{t(ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_SUBTITLE)}</span>
            </div>
            <button onClick={() => updateIdentityVerification({ hasUploadedId: true })}>
              {t(ONBOARDING.IDENTITY_VERIFICATION.CHOOSE_FILE_BUTTON)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
