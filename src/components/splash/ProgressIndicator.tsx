'use client';

import { useEffect, useState } from 'react';
import { useTranslation, type TranslationKey } from '@/platform/ui';
import { UiDiv, UiSpan } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

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
    <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="w-full max-w-xs flex flex-col items-center z-10 px-4">
      <UiDiv ui={COMMON_LAYOUT.CONTAINER}
        className="h-8 text-xs font-semibold text-secondary text-center px-4 transition-all duration-500 ease-in-out"
        style={{ color: 'var(--gova-secondary)' }}
      >
        {status || t(PROGRESS_MESSAGE_KEYS[msgIndex]!)}
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="w-full mt-4 bg-surface-container-highest h-1 rounded-full overflow-hidden relative shadow-inner">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER}
          className="h-full bg-primary transition-all duration-300 ease-out shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-1.5 mt-2">
        <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-xs font-semibold text-on-surface-variant">
          {t('splash.loading')}
        </UiSpan>
        <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-xs font-semibold text-primary">
          {progress}%
        </UiSpan>
      </UiDiv>
    </UiDiv>
  );
}
