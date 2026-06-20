'use client';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

import { useTranslation, type TranslationKey, HOME } from '@/platform/ui';


const SLIDES: Array<{
  id: string;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  badgeColor: string;
  badgeTextColor: string;
  imgSrc: string;
}> = [
  {
    id: 'hero-slide-1',
    badgeKey: 'home.heroSlider.slide1Badge',
    titleKey: 'home.heroSlider.slide1Title',
    badgeColor: 'var(--gova-warning)',
    badgeTextColor: 'var(--gova-on-warning)',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8-m7Ccp-1Px2GILiQBkEVbicyFRjjkymFy8ZFtdhuYRL8pQON8o1CIXyU6BN7JVfZrAI0yvezebhNWRoGVMHvg0DN77QP6OfeYY8W2MCXLeJfVyaMNxSGJlX3P3iAMznOw9eICUGva3NKPLGLvI8cNctLItAwJr7ENeM_1D_78vtUOVOwDnSGcbsS5HOdrkOT1zMs8uhh-xaosMu8LdnGFafiAQEvo9WJamGcpA3K5rbhwKVtLkguHv9lD35rXTuja9bBvgTzrkIj',
  },
  {
    id: 'hero-slide-2',
    badgeKey: 'home.heroSlider.slide2Badge',
    titleKey: 'home.heroSlider.slide2Title',
    badgeColor: 'var(--gova-success)',
    badgeTextColor: 'var(--gova-on-success)',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5BKAM75HnyHLdSANV4UMPvSgTfcM9isT6xav32tg3Gvhoo2VHZS2bjvuAmMZ-WMizUytLM-OSXNJGlwlpSSHUzeUCPhSlf-13GvVtmlFYRo8KBxJHUd6C7-TfCGGAm31WcQmrU3uAhVycmQoa7cbdByUtAph_Lnc9fP7QJRlCAh2IAm_pBfGGn-_wmPqP3YSDPVN7R81BJObut_pcxju-opt0cQMpN0kLCsQLQnttGb-QWeNyipOCwPx-GmOSicTzoq5QKsdZTA',
  },
];

export function HeroSlider() {
  const { t, locale } = useTranslation();
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent(prev => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance]);

  return (
    <section data-ui-uuid={HOME.HERO_SLIDER.CONTAINER.uuid} id="hero-slider-section" className="reveal active mt-4 relative overflow-hidden rounded-xl shadow-sm h-48 sm:h-64 md:h-80 lg:h-96 w-full">
      <div data-ui-uuid={HOME.HERO_SLIDER.SLIDER_TRACK.uuid} id="hero-main-slider" className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(${locale === 'ar' ? current * 100 : -current * 100}%)` }}>
        {SLIDES.map(slide => (
          <div data-ui-uuid={HOME.HERO_SLIDER.SLIDE.uuid} key={slide.id} id={slide.id} className="min-w-full h-full relative" style={{ flexShrink: 0 }}>
            <Image data-ui-uuid={HOME.HERO_SLIDER.SLIDE_IMAGE.uuid} src={slide.imgSrc} alt={t(slide.titleKey)} fill className="object-cover" />
            <div data-ui-uuid={HOME.HERO_SLIDER.SLIDE_CONTENT.uuid} className="absolute inset-0 flex flex-col justify-center px-6 text-on-primary" style={{ background: 'linear-gradient(to left, var(--gova-primary), var(--gova-primary-container), transparent)' }}>
              <span data-ui-uuid={HOME.HERO_SLIDER.SLIDE_BADGE.uuid} className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-2" style={{ background: slide.badgeColor, color: slide.badgeTextColor }}>
                {t(slide.badgeKey)}
              </span>
              <h2 data-ui-uuid={HOME.HERO_SLIDER.SLIDE_TITLE.uuid} className="text-2xl font-bold leading-tight">
                {t(slide.titleKey)}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div data-ui-uuid={HOME.HERO_SLIDER.INDICATORS.uuid} id="slider-indicators" className="absolute bottom-4 start-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <div data-ui-uuid={HOME.SHELL.BADGEKEY_CONTAINER_L68.uuid} key={i} id={`indicator-${i}`} className="h-1.5 rounded-full bg-on-primary transition-all" style={{ width: i === current ? '32px' : '8px', opacity: i === current ? 1 : 0.4 }} />
        ))}
      </div>
    </section>
  );
}
