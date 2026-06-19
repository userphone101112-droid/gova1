'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation, type TranslationKey } from '@/platform/ui';
import { UiImage, UiLabel, UiHeader, UiSection, UiDiv } from '@/platform/ui';
import { HOME } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

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
    <UiSection
      ui={HOME.HERO_SLIDER.CONTAINER}
      id="hero-slider-section"
      className="reveal active mt-4 relative overflow-hidden rounded-xl shadow-sm h-48 sm:h-64 md:h-80 lg:h-96 w-full"
    >
      <UiDiv
        ui={HOME.HERO_SLIDER.SLIDER_TRACK}
        id="hero-main-slider"
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${locale === 'ar' ? current * 100 : -current * 100}%)` }}
      >
        {SLIDES.map(slide => (
          <UiDiv
            ui={HOME.HERO_SLIDER.SLIDE}
            key={slide.id}
            id={slide.id}
            className="min-w-full h-full relative"
            style={{ flexShrink: 0 }}
          >
            <UiImage
              ui={HOME.HERO_SLIDER.SLIDE_IMAGE}
              src={slide.imgSrc}
              alt={t(slide.titleKey)}
              fill
              className="object-cover"
            />
            <UiDiv
              ui={HOME.HERO_SLIDER.SLIDE_CONTENT}
              className="absolute inset-0 flex flex-col justify-center px-6 text-on-primary"
              style={{ background: 'linear-gradient(to left, var(--gova-primary), var(--gova-primary-container), transparent)' }}
            >
              <UiLabel
                ui={HOME.HERO_SLIDER.SLIDE_BADGE}
                className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-2"
                style={{ background: slide.badgeColor, color: slide.badgeTextColor }}
              >
                {t(slide.badgeKey)}
              </UiLabel>
              <UiHeader
                ui={HOME.HERO_SLIDER.SLIDE_TITLE}
                level={2}
                className="text-2xl font-bold leading-tight"
              >
                {t(slide.titleKey)}
              </UiHeader>
            </UiDiv>
          </UiDiv>
        ))}
      </UiDiv>

      {/* Dot indicators */}
      <UiDiv
        ui={HOME.HERO_SLIDER.INDICATORS}
        id="slider-indicators"
        className="absolute bottom-4 start-1/2 -translate-x-1/2 flex gap-2"
      >
        {SLIDES.map((_, i) => (
          <UiDiv ui={COMMON_LAYOUT.CONTAINER}
            key={i}
            id={`indicator-${i}`}
            className="h-1.5 rounded-full bg-on-primary transition-all"
            style={{ width: i === current ? '32px' : '8px', opacity: i === current ? 1 : 0.4 }}
          />
        ))}
      </UiDiv>
    </UiSection>
  );
}
