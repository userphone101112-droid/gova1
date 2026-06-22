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
    { id: '', label: t('onboarding.identity-verification.idTypePlaceholder') },
    { id: 'passport', label: t('onboarding.identity-verification.idTypePassport') },
    { id: 'driver-license', label: t('onboarding.identity-verification.idTypeDriverLicense') },
    { id: 'national-id', label: t('onboarding.identity-verification.idTypeNationalId') },
  ];

  return (
    <div className="w-full">
      <h1 data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.TITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.TITLE.uuid}`} className="text-3xl font-bold tracking-tight mb-2">{t('onboarding.identity-verification.title')}</h1>
      <p data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.DESCRIPTION.uuid}`} className="text-muted-foreground mb-8">{t('onboarding.identity-verification.description')}</p>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.FIRST_NAME_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.FIRST_NAME_LABEL.uuid}`}>{t('onboarding.identity-verification.firstName')}</span>
            <input value={identityVerification.firstName || ''} onChange={(e) => updateIdentityVerification({ firstName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.LAST_NAME_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.LAST_NAME_LABEL.uuid}`}>{t('onboarding.identity-verification.lastName')}</span>
            <input value={identityVerification.lastName || ''} onChange={(e) => updateIdentityVerification({ lastName: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.DATE_OF_BIRTH_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.DATE_OF_BIRTH_LABEL.uuid}`}>{t('onboarding.identity-verification.dateOfBirth')}</span>
          <input type="date" value={identityVerification.dateOfBirth || ''} onChange={(e) => updateIdentityVerification({ dateOfBirth: e.target.value })} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.EMAIL_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.EMAIL_LABEL.uuid}`}>{t('onboarding.identity-verification.email')}</span>
            <input type="email" value={identityVerification.email || ''} onChange={(e) => updateIdentityVerification({ email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.PHONE_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.PHONE_LABEL.uuid}`}>{t('onboarding.identity-verification.phone')}</span>
            <input value={identityVerification.phone || ''} onChange={(e) => updateIdentityVerification({ phone: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.ID_TYPE_LABEL.uuid}`}>{t('onboarding.identity-verification.idType')}</span>
          <select value={identityVerification.idType || ''} onChange={(e) => updateIdentityVerification({ idType: e.target.value as any })}>
            {idTypes.map((t) => (
              <option data-ui-instance-id={t.id} key={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.ID_NUMBER_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.ID_NUMBER_LABEL.uuid}`}>{t('onboarding.identity-verification.idNumber')}</span>
          <input value={identityVerification.idNumber || ''} onChange={(e) => updateIdentityVerification({ idNumber: e.target.value })} />
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-6 border-2 border-dashed rounded-lg border-outline-variant">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_LABEL.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_LABEL.uuid}`} className="font-medium">{t('onboarding.identity-verification.uploadId')}</span>
              <span data-ui-uuid={ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${ONBOARDING.IDENTITY_VERIFICATION.UPLOAD_ID_SUBTITLE.uuid}`} className="text-sm text-muted-foreground">{t('onboarding.identity-verification.uploadIdSubtitle')}</span>
            </div>
            <button onClick={() => updateIdentityVerification({ hasUploadedId: true })}>
              {t('onboarding.identity-verification.chooseFile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
