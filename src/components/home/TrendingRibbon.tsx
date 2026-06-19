'use client';

import { useTranslation, type TranslationKey } from '@/platform/ui';
import { TrendingUp } from 'lucide-react';
import { UiDiv, UiSpan } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

const TRENDING_ITEMS: TranslationKey[] = [
  'home.trending.item1',
  'home.trending.item2',
  'home.trending.item3',
  'home.trending.item4',
  'home.trending.item1',
  'home.trending.item2',
  'home.trending.item3',
  'home.trending.item4',
];

export function TrendingRibbon() {
  const { t } = useTranslation();

  return (
    <UiDiv
      ui={COMMON_LAYOUT.WRAPPER}
      id="trending-ribbon-container"
      className="border-y border-outline-variant overflow-hidden whitespace-nowrap relative flex items-center py-2 bg-surface-container-low"
    >
      <UiDiv
        ui={COMMON_LAYOUT.WRAPPER}
        id="trending-label-container"
        className="flex items-center gap-2 px-4 z-10 border-s border-outline-variant bg-surface-container-low"
      >
        <TrendingUp className="w-5 h-5 animate-pulse text-brand-red" />
        <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-xs font-bold text-on-surface">
          {t('home.trending.label')}
        </UiSpan>
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.WRAPPER} id="trending-items-marquee" className="flex gap-8 animate-trending items-center pr-4">
        {TRENDING_ITEMS.map((key, i) => (
          <UiSpan key={i} ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-8">
            <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-sm text-on-surface-variant">
              {t(key)}
            </UiSpan>
            <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-brand-blue">{"•"}</UiSpan>
          </UiSpan>
        ))}
      </UiDiv>
    </UiDiv>
  );
}
