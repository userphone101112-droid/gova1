'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';

interface ProgressIndicatorProps {
  progress: number;
  status: string;
}

export default function ProgressIndicator({ progress, status }: ProgressIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 z-10">
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-white text-lg font-medium">
        {progress}%
      </div>
      <div className="text-white/80 text-sm">
        {status || t('splash.loading')}
      </div>
    </div>
  );
}
