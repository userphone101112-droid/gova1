'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';

const MARQUEE_CARDS = [
  { id: 'marquee-card-1',     titleKey: 'home.marquee.card1Title', priceKey: 'home.marquee.card1Price', img: 'https://lh3.googleusercontent.com/aida/AP1WRLtEUw6-qlL4o6Qccuslz1ZFGyo83z47nMN7FSEUDCYEw7AmquNAI3tN3jdpOMpDsahuSh4II8mz0ZnUIegHIHyRkB7kcJt1_GZ5q7NxVHab9PlnvnbrC0HmMGwXcGNLsd-mdIcumjQK-ll095WLGyg2Bbgaj5xGVewZsvspEwrQ8K8C_hDg-3vjVh_luRgh55lpnUtP27RbO7Ot7bGWqQkJj5ZzWL2PA9F7s2rfdBrw-Gw7uq23XYKJ5w' },
  { id: 'marquee-card-2',     titleKey: 'home.marquee.card2Title', priceKey: 'home.marquee.card2Price', img: 'https://lh3.googleusercontent.com/aida/AP1WRLviJKEzNj5O3szQyiiMOFYN5bTLlY84ez7aSiImrwY0HivS7FHIEANp1nr_fgrtJHR6LTMcoGuQ3qowcAiMbyjDhdY2Po6aa6wNqdkxrUVTWJ_xEvzc4qdfjrurOQStMajPl3obgSHeX5JUPma_43KfT_1q54qVCQlm9evFkrPeEJBNImF7Xd2xe355-hgysUpJDstGX_4pzskHwJXSd0TAQvK1H1LX-aQepVahM1SoEfG06yECjnoEIg' },
  { id: 'marquee-card-3',     titleKey: 'home.marquee.card3Title', priceKey: 'home.marquee.card3Price', img: 'https://lh3.googleusercontent.com/aida/AP1WRLsd8xKnUFaAmAC-62H9fY8gRyJqkMK95ilrnZkBvmtXgQ7RnCn02VTTSb1ASmlXIEwxKY1HlYYc-5OqK30TlrnJZeJ4_G7PvX1y0-ie6TuP-VXKZpJkQok7g3s3uGq9eNkxDBDWRxOyATAa9Eal7864mbBmTpCamL0gvgu7t76o3sYzVreHzLSm3RiGesXWjcR-3JhYX3psmBViPfSSKdzcoZJIl3wN_3yCzX36jnorjpQnJatK45FOPw' },
  // Duplicates for seamless loop
  { id: 'marquee-card-1-dup', titleKey: 'home.marquee.card1Title', priceKey: 'home.marquee.card1Price', img: 'https://lh3.googleusercontent.com/aida/AP1WRLtEUw6-qlL4o6Qccuslz1ZFGyo83z47nMN7FSEUDCYEw7AmquNAI3tN3jdpOMpDsahuSh4II8mz0ZnUIegHIHyRkB7kcJt1_GZ5q7NxVHab9PlnvnbrC0HmMGwXcGNLsd-mdIcumjQK-ll095WLGyg2Bbgaj5xGVewZsvspEwrQ8K8C_hDg-3vjVh_luRgh55lpnUtP27RbO7Ot7bGWqQkJj5ZzWL2PA9F7s2rfdBrw-Gw7uq23XYKJ5w' },
  { id: 'marquee-card-2-dup', titleKey: 'home.marquee.card2Title', priceKey: 'home.marquee.card2Price', img: 'https://lh3.googleusercontent.com/aida/AP1WRLviJKEzNj5O3szQyiiMOFYN5bTLlY84ez7aSiImrwY0HivS7FHIEANp1nr_fgrtJHR6LTMcoGuQ3qowcAiMbyjDhdY2Po6aa6wNqdkxrUVTWJ_xEvzc4qdfjrurOQStMajPl3obgSHeX5JUPma_43KfT_1q54qVCQlm9evFkrPeEJBNImF7Xd2xe355-hgysUpJDstGX_4pzskHwJXSd0TAQvK1H1LX-aQepVahM1SoEfG06yECjnoEIg' },
  { id: 'marquee-card-3-dup', titleKey: 'home.marquee.card3Title', priceKey: 'home.marquee.card3Price', img: 'https://lh3.googleusercontent.com/aida/AP1WRLsd8xKnUFaAmAC-62H9fY8gRyJqkMK95ilrnZkBvmtXgQ7RnCn02VTTSb1ASmlXIEwxKY1HlYYc-5OqK30TlrnJZeJ4_G7PvX1y0-ie6TuP-VXKZpJkQok7g3s3uGq9eNkxDBDWRxOyATAa9Eal7864mbBmTpCamL0gvgu7t76o3sYzVreHzLSm3RiGesXWjcR-3JhYX3psmBViPfSSKdzcoZJIl3wN_3yCzX36jnorjpQnJatK45FOPw' },
];

export function FeaturedMarquee() {
  const { t } = useTranslation();

  return (
    <section id="featured-marquee-section" className="overflow-hidden reveal active space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--gova-primary)' }}>
          {"stars"}
        </span>
        <h3
          id="featured-section-title"
          className="text-xl font-bold"
          style={{ color: 'var(--gova-on-surface)' }}
        >
          {t('home.featured.title')}
        </h3>
      </div>

      <div
        id="marquee-container"
        className="relative flex overflow-hidden py-4 border-y"
        style={{ background: 'var(--gova-surface-container-low)', borderColor: 'var(--gova-outline-variant)' }}
      >
        <div id="marquee-content" className="animate-marquee-cards gap-4 pr-4">
          {MARQUEE_CARDS.map(card => (
            <div
              key={card.id}
              id={card.id}
              className="flex-none w-40 rounded-xl p-2 shadow-sm border"
              style={{
                background: 'var(--gova-surface-container-lowest)',
                borderColor: 'var(--gova-outline-variant)',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.img}
                alt={t(card.titleKey)}
                className="w-full aspect-square object-cover rounded-lg mb-2 transition-transform active:scale-105"
              />
              <p className="text-xs font-bold truncate" style={{ color: 'var(--gova-on-surface)' }}>
                {t(card.titleKey)}
              </p>
              <p className="text-xs font-bold" style={{ color: 'var(--gova-google-blue)' }}>
                {t(card.priceKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
