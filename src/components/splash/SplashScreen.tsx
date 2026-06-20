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
      setErrorMsg(t(SPLASH.MAINTENANCE.INVALID_CODE));
    }
  };

  if (activeMaint) {
    return (
      <div data-ui-uuid={SPLASH.MAINTENANCE.CONTAINER.uuid} className="min-h-screen bg-background text-on-background flex items-center justify-center p-4 selection:bg-primary-fixed selection:text-on-primary-fixed" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div data-ui-uuid={SPLASH.MAINTENANCE.CARD.uuid} className="bg-surface-container border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-6">
          <div data-ui-uuid={SPLASH.MAINTENANCE.ICON_CONTAINER.uuid} className="mb-2 relative group">
            <div data-ui-uuid={SPLASH.MAINTENANCE_GLOW.uuid} className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div data-ui-uuid={SPLASH.SHELL.MAINTENANCE_TITLE_WRAPPER_L56.uuid} className="w-20 h-20 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-2xl relative border-2 border-on-primary/20">
              <Store className="w-12 h-12 text-on-primary" />
            </div>
          </div>
          <h2 data-ui-uuid={SPLASH.MAINTENANCE.TITLE.uuid} className="text-2xl font-bold text-primary text-center mt-2">
            {t(SPLASH.MAINTENANCE.TITLE)}
          </h2>
          <div data-ui-uuid={SPLASH.SHELL.MAINTENANCE_TITLE_CONTAINER_L63.uuid} className="text-center text-on-surface-variant text-sm leading-relaxed">
            {settings.maintenance.message || t(SPLASH.MAINTENANCE.DEFAULT_MESSAGE)}
          </div>
          <div data-ui-uuid={SPLASH.SHELL.MAINTENANCE_TITLE_WRAPPER_L66.uuid} className="w-full flex flex-col gap-2 mt-2">
            <input data-ui-uuid={SPLASH.MAINTENANCE.FORM.PIN_INPUT.uuid} type="password" placeholder={t(SPLASH.MAINTENANCE.FORM.PIN_INPUT)} value={accessCodeInput} onChange={(e) => setAccessCodeInput(e.target.value)} onKeyDown={(e) => {
        if (e.key === 'Enter')
            handleVerify();
    }} className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-xl text-on-surface placeholder-on-surface-variant/50 text-center outline-none focus:border-primary transition-all" />
            {errorMsg && (
              <div data-ui-uuid={SPLASH.SHELL.MAINTENANCE_TITLE_CONTAINER_L72.uuid} className="text-error text-xs text-center font-medium mt-1">
                {errorMsg}
              </div>
            )}
          </div>
          <button data-ui-uuid={SPLASH.MAINTENANCE.FORM.SUBMIT_BUTTON.uuid} onClick={handleVerify} className="w-full py-3 bg-primary text-on-primary font-semibold rounded-xl active:scale-95 transition-transform shadow-lg cursor-pointer">
            {t(SPLASH.MAINTENANCE.FORM.SUBMIT_BUTTON)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main data-ui-uuid={SPLASH.LOGO.IMAGE.uuid} className="bg-background text-on-background min-h-screen relative w-full flex flex-col items-center justify-between py-12 px-4 overflow-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      <TopMarquee categories={data?.categories || []} />

      <div data-ui-uuid={SPLASH.SHELL.LOGO_HEADING_WRAPPER_L89.uuid} className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-sm">
        <div data-ui-uuid={SPLASH.SHELL.LOGO_HEADING_WRAPPER_L90.uuid} className="mb-6 relative group">
          <div data-ui-uuid={SPLASH.LOGO_GLOW.uuid} className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
          <div data-ui-uuid={SPLASH.SHELL.LOGO_HEADING_WRAPPER_L92.uuid} className="w-24 h-24 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-2xl relative border-2 border-on-primary/20">
            <Store className="w-14 h-14 text-on-primary" />
          </div>
        </div>
        <h1 data-ui-uuid={SPLASH.LOGO.HEADING.uuid} className="text-3xl font-bold text-primary mb-1 tracking-tight text-center">
          {t(SPLASH.LOGO.HEADING)}
        </h1>
        <div data-ui-uuid={SPLASH.SHELL.LOGO_TAGLINE_CONTAINER_L99.uuid} className="text-base text-on-surface-variant font-medium tracking-wide">
          {t(SPLASH.LOGO.TAGLINE)}
        </div>

        <div data-ui-uuid={SPLASH.SHELL.LOGO_HEADING_WRAPPER_L103.uuid} className="mt-8 w-full flex flex-col items-center">
          <Suspense fallback={null}>
            <SplashInitializer />
          </Suspense>
        </div>
      </div>

      <div data-ui-uuid={SPLASH.SCREEN_GRADIENT.uuid} className="fixed bottom-0 start-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none -z-10"></div>

      <BottomRibbons subcategories={data?.subcategories || []} />
    </main>
  );
}
