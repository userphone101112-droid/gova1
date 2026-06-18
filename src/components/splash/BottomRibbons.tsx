'use client';

import { Laptop, Factory, Boxes } from 'lucide-react';
import { useTranslation, type TranslationKey } from '@/platform/ui';
import { UiDiv, UiSpan } from '@/platform/ui';
import { COMMON_LAYOUT, DECORATIVE } from '@/platform/ui/registry/categories';

const STATIC_SUBCATEGORIES: Array<{
  icon: typeof Laptop;
  titleKey: TranslationKey;
}> = [
  { icon: Laptop, titleKey: 'splash.marquee.bottomElectronics' },
  { icon: Factory, titleKey: 'splash.marquee.bottomIndustrial' },
  { icon: Boxes, titleKey: 'splash.marquee.bottomSupplies' },
];

export default function BottomRibbons({}: { subcategories?: unknown[] }) {
  const { t } = useTranslation();
  const displayItems = [
    ...STATIC_SUBCATEGORIES,
    ...STATIC_SUBCATEGORIES,
    ...STATIC_SUBCATEGORIES,
    ...STATIC_SUBCATEGORIES,
  ];

  return (
    <UiDiv ui={DECORATIVE.BACKGROUND} className="absolute bottom-0 start-0 w-full overflow-hidden opacity-30 pointer-events-none mb-8 z-0">
      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex gap-4 py-4 shrink-0 animate-marquee-left">
        {displayItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <UiDiv
              key={index}
              ui={COMMON_LAYOUT.CONTAINER}
              className="w-48 h-32 rounded-xl bg-surface-container-high flex flex-col items-center justify-center border border-outline-variant flex-shrink-0"
            >
              <Icon className="text-primary w-10 h-10 mb-2" />
              <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-xs font-semibold text-on-surface">
                {t(item.titleKey)}
              </UiSpan>
            </UiDiv>
          );
        })}
      </UiDiv>
    </UiDiv>
  );
}
