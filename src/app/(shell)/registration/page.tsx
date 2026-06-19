import { Suspense } from 'react';

import { RegistrationPageContent } from '@/components/auth/RegistrationPageContent';
import { UiDiv } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

function RegistrationFallback() {
  return (
    <UiDiv ui={AUTH.SHARED.PAGE} className="auth-page flex items-center justify-center">
      <UiDiv ui={AUTH.SHARED.FORM_CARD} className="type-body-md text-on-surface-variant">
        …
      </UiDiv>
    </UiDiv>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={<RegistrationFallback />}>
      <RegistrationPageContent />
    </Suspense>
  );
}
