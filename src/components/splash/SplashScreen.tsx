'use client';

import { Store } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

import { runInitialization } from '@/lib/initialization/initialization';
import { useTranslation, SPLASH } from '@/platform/ui';
import { useUnifiedStore } from '@/store/unified.store';
import { SplashData } from '@/types/splash';

import BottomRibbons from './BottomRibbons';
import SplashInitializer from './SplashInitializer';
import TopMarquee from './TopMarquee';

export default function SplashScreen() {
  const { t } = useTranslation();
  const [data, setData] = useState<SplashData | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const settings = useUnifiedStore((state) => state.settings);
  const isMaintenanceActive = useUnifiedStore((state) => state.isMaintenanceActive);
  const getEffectiveLanguage = useUnifiedStore((state) => state.getEffectiveLanguage);
  const setMaintenanceBypass = useUnifiedStore((state) => state.setMaintenanceBypass);

  const activeMaint = isMaintenanceActive();
  const lang = getEffectiveLanguage();

  useEffect(() => {
    if (activeMaint) return;

    const initialize = async () => {
      const splashData = await runInitialization(() => {});
      setData(splashData);
    };

    initialize();
  }, [activeMaint]);

  const handleVerify = () => {
    if (accessCodeInput === settings.maintenance.accessCode) {
      setMaintenanceBypass(true);
      setErrorMsg('');
    } else {
      setErrorMsg(t('splash.maintenance.invalidCode'));
    }
  };

  if (activeMaint) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center p-4 selection:bg-primary-fixed selection:text-on-primary-fixed" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-6">
          <div className="mb-2 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="w-20 h-20 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-2xl relative border-2 border-on-primary/20">
              <Store className="w-12 h-12 text-on-primary" />
            </div>
          </div>
          <h2
            data-ui-uuid={SPLASH.MAINTENANCE.TITLE.uuid}
            data-ui-lang-uuid={`lang-${SPLASH.MAINTENANCE.TITLE.uuid}`}
            className="text-2xl font-bold text-primary text-center mt-2"
          >
            {t('splash.maintenance.title')}
          </h2>
          <div className="text-center text-on-surface-variant text-sm leading-relaxed">
            {settings.maintenance.message || t('splash.maintenance.defaultMessage')}
          </div>
          <div className="w-full flex flex-col gap-2 mt-2">
            <input
              data-ui-uuid={SPLASH.MAINTENANCE.FORM.PIN_INPUT.uuid}
              data-ui-lang-uuid={`lang-${SPLASH.MAINTENANCE.FORM.PIN_INPUT.uuid}`}
              type="password"
              placeholder={t('splash.maintenance.pinInput')}
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter')
                  handleVerify();
              }}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-xl text-on-surface placeholder-on-surface-variant/50 text-center outline-none focus:border-primary transition-all"
            />
            {errorMsg && (
              <div className="text-error text-xs text-center font-medium mt-1">
                {errorMsg}
              </div>
            )}
          </div>
          <button
            data-ui-uuid={SPLASH.MAINTENANCE.FORM.SUBMIT_BUTTON.uuid}
            data-ui-lang-uuid={`lang-${SPLASH.MAINTENANCE.FORM.SUBMIT_BUTTON.uuid}`}
            onClick={handleVerify}
            className="w-full py-3 bg-primary text-on-primary font-semibold rounded-xl active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            {t('splash.maintenance.submitButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main data-ui-uuid={SPLASH.LOGO.IMAGE.uuid} className="bg-background text-on-background min-h-screen relative w-full flex flex-col items-center justify-between py-12 px-4 overflow-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      <TopMarquee categories={data?.categories || []} />

      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-sm">
        <div className="mb-6 relative group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
          <div className="w-24 h-24 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-2xl relative border-2 border-on-primary/20">
            <Store className="w-14 h-14 text-on-primary" />
          </div>
        </div>
        <h1
          data-ui-uuid={SPLASH.LOGO.HEADING.uuid}
          data-ui-lang-uuid={`lang-${SPLASH.LOGO.HEADING.uuid}`}
          className="text-3xl font-bold text-primary mb-1 tracking-tight text-center"
        >
          {t('splash.logo.heading')}
        </h1>
        <div
          data-ui-lang-uuid={`lang-${SPLASH.LOGO.TAGLINE.uuid}`}
          className="text-base text-on-surface-variant font-medium tracking-wide"
        >
          {t('splash.logo.tagline')}
        </div>

        <div className="mt-8 w-full flex flex-col items-center">
          <Suspense fallback={null}>
            <SplashInitializer />
          </Suspense>
        </div>
      </div>

      <div className="fixed bottom-0 start-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none -z-10"></div>

      <BottomRibbons subcategories={data?.subcategories || []} />
    </main>
  );
}
