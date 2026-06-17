'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { TrendingUp } from 'lucide-react';
import { UiDiv, UiSpan } from '@/components/ui';
import { DECORATIVE } from '@/shared/ui-registry/categories';

const TRENDING_ITEMS = [
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
    <UiDiv
      ui={DECORATIVE.SPACER}
      id="trending-ribbon-container"
      className="border-y overflow-hidden whitespace-nowrap relative flex items-center py-2"
      style={{ background: 'var(--gova-surface-container-low)', borderColor: 'var(--gova-outline-variant)' }}
    >
      {/* Static label */}
      <UiDiv
        ui={DECORATIVE.SPACER}
        id="trending-label-container"
        className="flex items-center gap-2 px-4 z-10 border-s"
        style={{ background: 'var(--gova-surface-container-low)', borderColor: 'var(--gova-outline-variant)' }}
      >
        <TrendingUp
          className="w-5 h-5 animate-pulse"
          style={{ color: 'var(--gova-google-red)' }}
        />
        <UiSpan ui={DECORATIVE.SPACER} className="text-xs font-bold" style={{ color: 'var(--gova-on-surface)' }}>
          {t('home.trending.label')}
        </UiSpan>
      </UiDiv>

      {/* Scrolling items */}
      <UiDiv ui={DECORATIVE.SPACER} id="trending-items-marquee" className="flex gap-8 animate-trending items-center pr-4">
        {TRENDING_ITEMS.map((key, i) => (
          <UiSpan key={i} ui={DECORATIVE.SPACER} className="flex items-center gap-8">
            <UiSpan ui={DECORATIVE.SPACER} className="text-sm" style={{ color: 'var(--gova-on-surface-variant)' }}>
              {t(key)}
            </UiSpan>
            <UiSpan ui={DECORATIVE.SPACER} style={{ color: 'var(--gova-google-blue)' }}>{"•"}</UiSpan>
          </UiSpan>
        ))}
      </UiDiv>
    </UiDiv>
  );
}
