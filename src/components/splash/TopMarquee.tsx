'use client';

import { useSettingsStore } from '@/store/settings.store';
import { Shirt, Car, Building2, HeartPulse } from 'lucide-react';
import { UiDiv, UiSpan } from '@/components/ui';
import { DECORATIVE } from '@/shared/ui-registry/categories';

const STATIC_CATEGORIES = [
  { icon: Shirt, titleEn: 'Fashion', titleAr: 'موضة' },
  { icon: Car, titleEn: 'Automotive', titleAr: 'سيارات' },
  { icon: Building2, titleEn: 'Real Estate', titleAr: 'عقارات' },
  { icon: HeartPulse, titleEn: 'Medical', titleAr: 'طب وصحة' },
] as const;

export default function TopMarquee({}: { categories?: any[] }) {
  const getEffectiveLanguage = useSettingsStore((state) => state.getEffectiveLanguage);
  const lang = getEffectiveLanguage();

  // Duplicate for seamless loop
  const displayItems = [...STATIC_CATEGORIES, ...STATIC_CATEGORIES, ...STATIC_CATEGORIES];

  return (
    <UiDiv ui={DECORATIVE.BACKGROUND} className="absolute top-0 start-0 w-full overflow-hidden opacity-40 pointer-events-none z-0">
      <UiDiv ui={DECORATIVE.SPACER} className="flex gap-4 py-4 shrink-0 animate-marquee-right">
        {displayItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <UiDiv
              key={index}
              ui={DECORATIVE.SPACER}
              className="w-48 h-32 rounded-xl bg-surface-container-high flex flex-col items-center justify-center border border-outline-variant flex-shrink-0"
            >
              <Icon className="text-primary w-10 h-10 mb-2" />
              <UiSpan ui={DECORATIVE.SPACER} className="text-xs font-semibold text-on-surface">
                {lang === 'ar' ? item.titleAr : item.titleEn}
              </UiSpan>
            </UiDiv>
          );
        })}
      </UiDiv>
    </UiDiv>
  );
}
