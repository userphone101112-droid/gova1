'use client';
import { Shield, Smartphone, Lock, Sparkles } from 'lucide-react';

import { useTranslation } from '@/platform/ui';
import { AUTH } from '@/platform/ui/registry/features/auth';

interface AuthHeroProps {
  variant: 'login' | 'registration';
}

export function AuthHero({ variant }: AuthHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="auth-hero hidden lg:flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 opacity-faint pointer-events-none">
        <div className="absolute top-20 start-20 w-72 h-72 rounded-full bg-primary-container blur-3xl" />
        <div className="absolute bottom-20 end-20 w-96 h-96 rounded-full bg-success-container blur-3xl" />
      </div>

      <div className="relative z-10 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-on-primary/10 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-on-primary" />
          </div>
          <span data-ui-uuid={AUTH.REGISTRATION.BRAND_NAME.uuid} className="type-title-lg text-on-primary">
            {t(AUTH.REGISTRATION.BRAND_NAME)}
          </span>
        </div>
      </div>

      <div className="relative z-10 px-12 pb-12">
        <blockquote className="space-y-4">
          {variant === 'login' ? (
            <>
              <p data-ui-uuid={AUTH.LOGIN.HERO_QUOTE.uuid} className="type-headline-md text-on-primary opacity-decorative leading-relaxed">
                &ldquo;{t(AUTH.LOGIN.HERO_QUOTE)}&rdquo;
              </p>
              <footer data-ui-uuid={AUTH.LOGIN.HERO_FOOTER.uuid} className="type-body-sm text-on-primary opacity-muted">
                {t(AUTH.LOGIN.HERO_FOOTER)}
              </footer>
            </>
          ) : (
            <>
              <p data-ui-uuid={AUTH.REGISTRATION.HEADING.uuid} className="type-headline-md text-on-primary opacity-decorative leading-relaxed">
                &ldquo;{t(AUTH.REGISTRATION.HEADING)}&rdquo;
              </p>
              <footer data-ui-uuid={AUTH.REGISTRATION.DESCRIPTION.uuid} className="type-body-sm text-on-primary opacity-muted">
                {t(AUTH.REGISTRATION.DESCRIPTION)}
              </footer>
            </>
          )}
        </blockquote>
      </div>

      <div className="relative z-10 px-12 pb-12">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2 text-on-primary opacity-muted type-body-sm">
            <Shield className="h-4 w-4" />
            {t(AUTH.SHARED.HIGHLIGHT_SECURITY)}
          </div>
          <div className="flex items-center gap-2 text-on-primary opacity-muted type-body-sm">
            <Smartphone className="h-4 w-4" />
            {t(AUTH.SHARED.HIGHLIGHT_PHONE)}
          </div>
          <div className="flex items-center gap-2 text-on-primary opacity-muted type-body-sm">
            <Lock className="h-4 w-4" />
            {t(AUTH.SHARED.HIGHLIGHT_ENCRYPTED)}
          </div>
        </div>
      </div>
    </div>
  );
}
