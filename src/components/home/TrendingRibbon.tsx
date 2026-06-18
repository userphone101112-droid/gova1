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
  // duplicated for seamless loop
  'home.trending.item1',
  'home.trending.item2',
  'home.trending.item3',
  'home.trending.item4',
];

export function TrendingRibbon() {
  const { t } = useTranslation();

  return (
    <UiDiv ui={COMMON_LAYOUT.WRAPPER}
      id="trending-ribbon-container"
      className="border-y overflow-hidden whitespace-nowrap relative flex items-center py-2"
      style={{ background: 'var(--gova-surface-container-low)', borderColor: 'var(--gova-outline-variant)' }}
    >
      {/* Static label */}
      <UiDiv ui={COMMON_LAYOUT.WRAPPER}
        id="trending-label-container"
        className="flex items-center gap-2 px-4 z-10 border-s"
        style={{ background: 'var(--gova-surface-container-low)', borderColor: 'var(--gova-outline-variant)' }}
      >
        <TrendingUp
          className="w-5 h-5 animate-pulse"
          style={{ color: 'var(--gova-google-red)' }}
        />
        <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-xs font-bold" style={{ color: 'var(--gova-on-surface)' }}>
          {t('home.trending.label')}
        </UiSpan>
      </UiDiv>

      {/* Scrolling items */}
      <UiDiv ui={COMMON_LAYOUT.WRAPPER} id="trending-items-marquee" className="flex gap-8 animate-trending items-center pr-4">
        {TRENDING_ITEMS.map((key, i) => (
          <UiSpan key={i} ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-8">
            <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-sm" style={{ color: 'var(--gova-on-surface-variant)' }}>
              {t(key)}
            </UiSpan>
            <UiSpan ui={COMMON_LAYOUT.SPAN} style={{ color: 'var(--gova-google-blue)' }}>{"•"}</UiSpan>
          </UiSpan>
        ))}
      </UiDiv>
    </UiDiv>
  );
}
