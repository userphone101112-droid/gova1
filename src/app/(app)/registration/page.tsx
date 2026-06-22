import { Suspense } from 'react';

import { RegistrationPageContent } from '@/components/auth/RegistrationPageContent';

function RegistrationFallback() {
  return (
    <div className="auth-page flex items-center justify-center">
      <div className="type-body-md text-on-surface-variant">
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
