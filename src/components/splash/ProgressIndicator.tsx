'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { SPLASH } from '@/shared/ui-registry';

interface ProgressIndicatorProps {
  progress: number;
  status: string;
}

const MESSAGES = {
  ar: [
    "اكتشف البائعين المحليين في الوقت الفعلي",
    "دفع آمن وشحن سريع",
    "أكبر سوق صناعي في السويس",
    "ربط المشترين مع بائعين موثوقين",
    "عروض حصرية على السيارات والأزياء"
  ],
  en: [
    "Discover local vendors in real-time",
    "Secure payments and fast shipping",
    "Suez's largest industrial marketplace",
    "Connecting buyers with reliable sellers",
    "Exclusive deals on Automotive & Fashion"
  ]
};

export default function ProgressIndicator({ progress, status }: ProgressIndicatorProps) {
  const getEffectiveLanguage = useSettingsStore((state) => state.getEffectiveLanguage);
  const lang = getEffectiveLanguage();
  
  const messages = MESSAGES[lang === 'ar' ? 'ar' : 'en'];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div
      className="w-full max-w-xs flex flex-col items-center z-10 px-4"
      data-ui-id={SPLASH.CONTAINER.id}
      data-ui-path="splash.main.display.progress-indicator"
      data-ui-feature={SPLASH.CONTAINER.feature}
    >
      {/* Marketing message rotating */}
      <div 
        className="h-8 text-xs font-semibold text-secondary text-center px-4 transition-all duration-500 ease-in-out"
        style={{ color: 'var(--gova-secondary)' }}
        data-ui-id={SPLASH.STATUS_TEXT.id}
        data-ui-path={SPLASH.STATUS_TEXT.path}
        data-ui-feature={SPLASH.STATUS_TEXT.feature}
      >
        {status || messages[msgIndex]}
      </div>
      
      {/* Progress bar track */}
      <div className="w-full mt-4 bg-surface-container-highest h-1 rounded-full overflow-hidden relative shadow-inner">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_8px_rgba(0,50,125,0.5)]" 
          style={{ width: `${progress}%` }}
          data-ui-id={SPLASH.PROGRESS_BAR.id}
          data-ui-path={SPLASH.PROGRESS_BAR.path}
          data-ui-feature={SPLASH.PROGRESS_BAR.feature}
        />
      </div>
      
      {/* Percentage and Loading text */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-xs font-semibold text-on-surface-variant">
          {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </span>
        <span className="text-xs font-semibold text-primary">
          {progress}%
        </span>
      </div>
    </div>
  );
}
