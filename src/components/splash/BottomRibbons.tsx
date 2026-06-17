'use client';

import { useSettingsStore } from '@/store/settings.store';
import { Laptop, Factory, Boxes } from 'lucide-react';
import { UiDiv, UiSpan } from '@/components/ui';
import { DECORATIVE } from '@/shared/ui-registry/categories';

const STATIC_SUBCATEGORIES = [
  { icon: Laptop, titleEn: 'Electronics', titleAr: 'إلكترونيات' },
  { icon: Factory, titleEn: 'Industrial', titleAr: 'صناعي' },
  { icon: Boxes, titleEn: 'Supplies', titleAr: 'مستلزمات' },
] as const;

export default function BottomRibbons({}: { subcategories?: any[] }) {
  const getEffectiveLanguage = useSettingsStore((state) => state.getEffectiveLanguage);
  const lang = getEffectiveLanguage();

  const displayItems = [...STATIC_SUBCATEGORIES, ...STATIC_SUBCATEGORIES, ...STATIC_SUBCATEGORIES, ...STATIC_SUBCATEGORIES];

  return (
    <UiDiv ui={DECORATIVE.BACKGROUND} className="absolute bottom-0 start-0 w-full overflow-hidden opacity-30 pointer-events-none mb-8 z-0">
      <UiDiv ui={DECORATIVE.SPACER} className="flex gap-4 py-4 shrink-0 animate-marquee-left">
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
