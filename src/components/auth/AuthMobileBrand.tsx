'use client';
import { Sparkles } from 'lucide-react';

import { useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

export function AuthMobileBrand() {
  const { t } = useTranslation();

  return (
    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <span data-ui-uuid={AUTH.REGISTRATION.BRAND_NAME.uuid}
          data-ui-lang-uuid={`lang-${AUTH.REGISTRATION.BRAND_NAME.uuid}`} className="type-title-lg text-on-surface">
        {t('auth.registration.brandName')}
      </span>
    </div>
  );
}
