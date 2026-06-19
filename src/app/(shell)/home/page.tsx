'use client';

import { HeroSlider }      from '@/components/home/HeroSlider';
import { CategoriesGrid }  from '@/components/home/CategoriesGrid';
import { FeaturedMarquee } from '@/components/home/FeaturedMarquee';
import { TrendingRibbon }  from '@/components/home/TrendingRibbon';
import { CuratedOffers }   from '@/components/home/CuratedOffers';
import { PromoBanner }     from '@/components/home/PromoBanner';

export default function HomePage() {
  return (
    <div
      id="main-content-container"
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
