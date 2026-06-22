'use client';
import { Shirt, Car, Building2, HeartPulse } from 'lucide-react';

import { useTranslation, type TranslationKey } from '@/platform/ui';


const STATIC_CATEGORIES: Array<{
  icon: typeof Shirt;
  titleKey: TranslationKey;
}> = [
  { icon: Shirt, titleKey: 'splash.marquee.topFashion' },
  { icon: Car, titleKey: 'splash.marquee.topAutomotive' },
  { icon: Building2, titleKey: 'splash.marquee.topRealEstate' },
  { icon: HeartPulse, titleKey: 'splash.marquee.topMedical' },
];

export default function TopMarquee({}: { categories?: unknown[] }) {
  const { t } = useTranslation();
  const displayItems = [...STATIC_CATEGORIES, ...STATIC_CATEGORIES, ...STATIC_CATEGORIES];

  return (
    <div className="absolute top-0 start-0 w-full overflow-hidden opacity-40 pointer-events-none z-0">
      <div className="flex gap-4 py-4 shrink-0 animate-marquee-right">
        {displayItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="w-48 h-32 rounded-xl bg-surface-container-high flex flex-col items-center justify-center border border-outline-variant flex-shrink-0">
              <Icon className="text-primary w-10 h-10 mb-2" />
              <span className="text-xs font-semibold text-on-surface">
                {t(item.titleKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
