'use client';

import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';

import { UiButton, UiInput } from '@/components/ui-identified';
import { runInitialization } from '@/lib/initialization/initialization';
import { SPLASH } from '@/shared/ui-registry';
import { useSettingsStore } from '@/store/settings.store';
import { SplashData } from '@/types/splash';

import BottomRibbons from './BottomRibbons';
import SplashInitializer from './SplashInitializer';
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

  const t = translations[lang === 'ar' ? 'ar' : 'en'];

  if (activeMaint) {
    return (
      <div 
        className="min-h-screen bg-background text-on-background flex items-center justify-center p-4 selection:bg-primary-fixed selection:text-on-primary-fixed" 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-6">
          <div className="mb-2 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="w-20 h-20 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-2xl relative border-2 border-white/20">
              <Store className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-primary text-center mt-2">
            {t.title}
          </h2>
          <p className="text-center text-on-surface-variant text-sm leading-relaxed">
            {settings.maintenance.message || t.defaultMsg}
          </p>
          <div className="w-full flex flex-col gap-2 mt-2">
            <UiInput
              ui={SPLASH.MAINTENANCE.FORM.PIN_INPUT}
              type="password"
              placeholder={t.placeholder}
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify();
              }}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline rounded-xl text-on-surface placeholder-on-surface-variant/50 text-center outline-none focus:border-primary transition-all"
            />
            {errorMsg && (
              <span className="text-error text-xs text-center font-medium mt-1">
                {errorMsg}
              </span>
            )}
          </div>
          <UiButton
            ui={SPLASH.MAINTENANCE.FORM.SUBMIT_BUTTON}
            onClick={handleVerify}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl active:scale-95 transition-transform shadow-lg cursor-pointer"
          >
            {t.verify}
          </UiButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen relative w-full flex flex-col items-center justify-between py-12 px-4 overflow-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Visual Context: Animated Category Banner */}
      <TopMarquee categories={data?.categories || []} />
      
      {/* Center Identity Section */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-sm">
        <div className="mb-6 relative group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
          <div className="w-24 h-24 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-2xl relative border-2 border-white/20">
            <Store className="w-14 h-14 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-primary mb-1 tracking-tight text-center">
          {lang === 'ar' ? 'سوق جوفا' : 'GoVa Marketplace'}
        </h1>
        <p className="text-base text-on-surface-variant font-medium tracking-wide">
          {lang === 'ar' ? 'السويس بين يديك' : 'Suez at Your Fingertips'}
        </p>
        
        {/* Bottom Context: Loading & Messages */}
        <div className="mt-8 w-full flex flex-col items-center">
          <SplashInitializer />
        </div>
      </div>

      {/* Background Decorative Element (Subtle Glass Gradient) */}
      <div className="fixed bottom-0 start-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none -z-10"></div>

      {/* Lower Secondary Banner (Opposite Direction) */}
      <BottomRibbons subcategories={data?.subcategories || []} />
    </div>
  );
}
