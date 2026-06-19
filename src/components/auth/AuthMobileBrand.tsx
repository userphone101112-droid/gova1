'use client';

import { Sparkles } from 'lucide-react';

import { UiDiv, UiSpan, useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

export function AuthMobileBrand() {
  const { t } = useTranslation();

  return (
    <UiDiv ui={AUTH.SHARED.MOBILE_BRAND} className="lg:hidden flex items-center justify-center gap-3 mb-8">
      <UiDiv
        ui={AUTH.SHARED.BRAND_ICON}
        className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center"
      >
        <Sparkles className="h-5 w-5 text-primary" />
      </UiDiv>
      <UiSpan ui={AUTH.REGISTRATION.BRAND_NAME} className="type-title-lg text-on-surface">
        {t(AUTH.REGISTRATION.BRAND_NAME)}
      </UiSpan>
    </UiDiv>
  );
}
