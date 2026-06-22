'use client';

import { CategoriesGrid } from '@/components/home/CategoriesGrid';
import { CuratedOffers } from '@/components/home/CuratedOffers';
import { FeaturedMarquee } from '@/components/home/FeaturedMarquee';
import { HeroSlider } from '@/components/home/HeroSlider';
import { PromoBanner } from '@/components/home/PromoBanner';
import { TrendingRibbon } from '@/components/home/TrendingRibbon';

export default function HomePage() {
  return (
    <div id="main-content-container"
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
