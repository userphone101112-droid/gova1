'use client';

import { useEffect, useState } from 'react';

import { UiButton, UiInput } from '@/components/ui-identified';
import { runInitialization } from '@/lib/initialization/initialization';
import { SPLASH } from '@/shared/ui-registry';
import { useSettingsStore } from '@/store/settings.store';
import { SplashData } from '@/types/splash';

import BottomRibbons from './BottomRibbons';
import SplashInitializer from './SplashInitializer';
import SplashLogo from './SplashLogo';
import TopMarquee from './TopMarquee';

export default function SplashScreen() {
  const [data, setData] = useState<SplashData | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const settings = useSettingsStore((state) => state.settings);
  const isMaintenanceActive = useSettingsStore((state) => state.isMaintenanceActive);
  const getEffectiveLanguage = useSettingsStore((state) => state.getEffectiveLanguage);
  const setMaintenanceBypass = useSettingsStore((state) => state.setMaintenanceBypass);

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
      setErrorMsg(lang === 'ar' ? 'رمز الدخول غير صحيح' : 'Invalid access code');
    }
  };

  const translations = {
    en: {
      title: 'Under Maintenance',
      placeholder: 'Enter access code',
      verify: 'Verify',
      defaultMsg: 'The system is currently undergoing scheduled maintenance. Please enter the access code to bypass.',
    },
    ar: {
      title: 'النظام قيد الصيانة',
      placeholder: 'أدخل رمز الدخول',
      verify: 'تحقق',
      defaultMsg: 'النظام حالياً قيد الصيانة المبرمجة. يرجى إدخل رمز الدخول للمتابعة.',
    }
  };

  const t = translations[lang];

  if (activeMaint) {
    return (
      <div className={"min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4"} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className={"bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl text-white flex flex-col items-center gap-6"}>
          <SplashLogo />
          <h2 className={"text-2xl font-bold text-center mt-2"}>
            {t.title}
          </h2>
          <p className={"text-center text-white/80 text-sm leading-relaxed"}>
            {settings.maintenance.message || t.defaultMsg}
          </p>
          <div className={"w-full flex flex-col gap-2 mt-2"}>
            <UiInput
              ui={SPLASH.MAINTENANCE.FORM.PIN_INPUT}
              type="password"
              placeholder={t.placeholder}
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify();
              }}
              className={"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 text-center outline-none focus:border-white/50 transition-all"}
            />
            {errorMsg && (
              <span className={"text-red-300 text-xs text-center font-medium mt-1"}>
                {errorMsg}
              </span>
            )}
          </div>
          <UiButton
            ui={SPLASH.MAINTENANCE.FORM.SUBMIT_BUTTON}
            onClick={handleVerify}
            className={"w-full py-3 bg-white text-blue-600 font-semibold rounded-xl active:scale-95 transition-transform shadow-lg cursor-pointer"}
          >
            {t.verify}
          </UiButton>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={"min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center"}>
        <SplashLogo />
        <SplashInitializer />
      </div>
    );
  }

  return (
    <div className={"min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex flex-col items-center justify-between py-8"}>
      <TopMarquee categories={data.categories} />
      <SplashLogo />
      <SplashInitializer />
      <BottomRibbons subcategories={data.subcategories} />
    </div>
  );
}
