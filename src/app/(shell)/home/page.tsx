'use client';

import { CategoriesGrid } from '@/components/home/CategoriesGrid';
import { CuratedOffers } from '@/components/home/CuratedOffers';
import { FeaturedMarquee } from '@/components/home/FeaturedMarquee';
import { HeroSlider } from '@/components/home/HeroSlider';
import { PromoBanner } from '@/components/home/PromoBanner';
import { TrendingRibbon } from '@/components/home/TrendingRibbon';
import { HOME } from '@/platform/ui/registry/features/home';
export default function HomePage() {
  return (
    <div
      data-ui-uuid={HOME.SHELL.HOME_L14.uuid} id="main-content-container"
      className="px-4 space-y-6"
      style={{ background: 'var(--gova-background)' }}
    >
      <HeroSlider />
      <CategoriesGrid />
      <FeaturedMarquee />
      <TrendingRibbon />
      <CuratedOffers />
      <PromoBanner />
    </div>
  );
}
