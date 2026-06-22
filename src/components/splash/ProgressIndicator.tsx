'use client';
import { useEffect, useState } from 'react';

import { useTranslation, type TranslationKey } from '@/platform/ui';


interface ProgressIndicatorProps {
  progress: number;
  status: string;
}

const PROGRESS_MESSAGE_KEYS: TranslationKey[] = [
  'splash.progress.message1',
  'splash.progress.message2',
  'splash.progress.message3',
  'splash.progress.message4',
  'splash.progress.message5',
];

export default function ProgressIndicator({ progress, status }: ProgressIndicatorProps) {
  const { t } = useTranslation();
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % PROGRESS_MESSAGE_KEYS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xs flex flex-col items-center z-10 px-4">
      <div className="h-8 text-xs font-semibold text-secondary text-center px-4 transition-all duration-500 ease-in-out" style={{ color: 'var(--gova-secondary)' }}>
        {status || t(PROGRESS_MESSAGE_KEYS[msgIndex]!)}
      </div>

      <div className="w-full mt-4 bg-surface-container-highest h-1 rounded-full overflow-hidden relative shadow-inner">
        <div className="h-full bg-primary transition-all duration-300 ease-out shadow-lg" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-xs font-semibold text-on-surface-variant">
          {t('splash.loading')}
        </span>
        <span className="text-xs font-semibold text-primary">
          {progress}%
        </span>
      </div>
    </div>
  );
}
