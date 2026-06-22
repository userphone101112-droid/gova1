'use client';
import { TrendingUp } from 'lucide-react';

import { useTranslation, type TranslationKey } from '@/platform/ui';


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
    <div id="trending-ribbon-container" className="border-y border-outline-variant overflow-hidden whitespace-nowrap relative flex items-center py-2 bg-surface-container-low">
      <div id="trending-label-container" className="flex items-center gap-2 px-4 z-10 border-s border-outline-variant bg-surface-container-low">
        <TrendingUp className="w-5 h-5 animate-pulse text-brand-red" />
        <span className="text-xs font-bold text-on-surface">
          {t('home.trending.label')}
        </span>
      </div>

      <div id="trending-items-marquee" className="flex gap-8 animate-trending items-center pr-4">
        {TRENDING_ITEMS.map((key, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="text-sm text-on-surface-variant">
              {t(key)}
            </span>
            <span className="text-brand-blue">{"•"}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
