import { Suspense } from 'react';

import { RegistrationPageContent } from '@/components/auth/RegistrationPageContent';
import { AUTH } from '@/platform/ui/registry/features/auth';

function RegistrationFallback() {
  return (
    <div data-ui-uuid={AUTH.SHARED.PAGE.uuid} className="auth-page flex items-center justify-center">
      <div data-ui-uuid={AUTH.SHARED.FORM_CARD.uuid} className="type-body-md text-on-surface-variant">
        …
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={<RegistrationFallback />}>
      <RegistrationPageContent />
    </Suspense>
  );
}
