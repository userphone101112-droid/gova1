'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { UiDiv, UiSpan } from '@/components/ui';
import { DECORATIVE } from '@/shared/ui-registry/categories';

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
    <UiDiv ui={DECORATIVE.SPACER} className="w-full max-w-xs flex flex-col items-center z-10 px-4">
      {/* Marketing message rotating */}
      <UiDiv 
        ui={DECORATIVE.SPACER}
        className="h-8 text-xs font-semibold text-secondary text-center px-4 transition-all duration-500 ease-in-out"
        style={{ color: 'var(--gova-secondary)' }}
      >
        {status || messages[msgIndex]}
      </UiDiv>
      
      {/* Progress bar track */}
      <UiDiv ui={DECORATIVE.SPACER} className="w-full mt-4 bg-surface-container-highest h-1 rounded-full overflow-hidden relative shadow-inner">
        <UiDiv 
          ui={DECORATIVE.SPACER}
          className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_8px_rgba(0,50,125,0.5)]" 
          style={{ width: `${progress}%` }}
        />
      </UiDiv>
      
      {/* Percentage and Loading text */}
      <UiDiv ui={DECORATIVE.SPACER} className="flex items-center gap-1.5 mt-2">
        <UiSpan ui={DECORATIVE.SPACER} className="text-xs font-semibold text-on-surface-variant">
          {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </UiSpan>
        <UiSpan ui={DECORATIVE.SPACER} className="text-xs font-semibold text-primary">
          {progress}%
        </UiSpan>
      </UiDiv>
    </UiDiv>
  );
}
