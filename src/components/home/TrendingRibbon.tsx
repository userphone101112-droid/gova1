'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';

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
    <div
      id="trending-ribbon-container"
      className="border-y overflow-hidden whitespace-nowrap relative flex items-center py-2"
      style={{ background: 'var(--gova-surface-container-low)', borderColor: 'var(--gova-outline-variant)' }}
    >
      {/* Static label */}
      <div
        id="trending-label-container"
        className="flex items-center gap-2 px-4 z-10 border-s"
        style={{ background: 'var(--gova-surface-container-low)', borderColor: 'var(--gova-outline-variant)' }}
      >
        <span
          className="material-symbols-outlined text-xl animate-pulse"
          style={{ color: 'var(--gova-google-red)' }}
        >
          {"trending_up"}
        </span>
        <span className="text-xs font-bold" style={{ color: 'var(--gova-on-surface)' }}>
          {t('home.trending.label')}
        </span>
      </div>

      {/* Scrolling items */}
      <div id="trending-items-marquee" className="flex gap-8 animate-trending items-center pr-4">
        {TRENDING_ITEMS.map((key, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="text-sm" style={{ color: 'var(--gova-on-surface-variant)' }}>
              {t(key)}
            </span>
            <span style={{ color: 'var(--gova-google-blue)' }}>{"•"}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
