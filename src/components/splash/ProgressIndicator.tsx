'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settings.store';

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
    <div className="w-full max-w-xs flex flex-col items-center z-10 px-4">
      {/* Marketing message rotating */}
      <div 
        className="h-8 text-xs font-semibold text-secondary text-center px-4 transition-all duration-500 ease-in-out"
        style={{ color: 'var(--gova-secondary)' }}
      >
        {status || messages[msgIndex]}
      </div>
      
      {/* Progress bar track */}
      <div className="w-full mt-4 bg-surface-container-highest h-1 rounded-full overflow-hidden relative shadow-inner">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_8px_rgba(0,50,125,0.5)]" 
          style={{ width: `${progress}%` }}
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
