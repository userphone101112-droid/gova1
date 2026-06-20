'use client';
import { Sparkles } from 'lucide-react';

import { useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

export function AuthMobileBrand() {
  const { t } = useTranslation();

  return (
    <div data-ui-uuid={AUTH.SHARED.MOBILE_BRAND.uuid} className="lg:hidden flex items-center justify-center gap-3 mb-8">
      <div data-ui-uuid={AUTH.SHARED.BRAND_ICON.uuid} className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <span data-ui-uuid={AUTH.REGISTRATION.BRAND_NAME.uuid} className="type-title-lg text-on-surface">
        {t(AUTH.REGISTRATION.BRAND_NAME)}
      </span>
    </div>
  );
}
