'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { Sparkles } from 'lucide-react';
import { HOME } from '@/shared/ui-registry';

const FEATURED = [
  {
    id: 'f1',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLtEUw6-qlL4o6Qccuslz1ZFGyo83z47nMN7FSEUDCYEw7AmquNAI3tN3jdpOMpDsahuSh4II8mz0ZnUIegHIHyRkB7kcJt1_GZ5q7NxVHab9PlnvnbrC0HmMGwXcGNLsd-mdIcumjQK-ll095WLGyg2Bbgaj5xGVewZsvspEwrQ8K8C_hDg-3vjVh_luRgh55lpnUtP27RbO7Ot7bGWqQkJj5ZzWL2PA9F7s2rfdBrw-Gw7uq23XYKJ5w',
    imgAlt: 'بدلة فاخرة', titleKey: 'home.featured.item1Title', price: '$599',
  },
  {
    id: 'f2',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLviJKEzNj5O3szQyiiMOFYN5bTLlY84ez7aSiImrwY0HivS7FHIEANp1nr_fgrtJHR6LTMcoGuQ3qowcAiMbyjDhdY2Po6aa6wNqdkxrUVTWJ_xEvzc4qdfjrurOQStMajPl3obgSHeX5JUPma_43KfT_1q54qVCQlm9evFkrPeEJBNImF7Xd2xe355-hgysUpJDstGX_4pzskHwJXSd0TAQvK1H1LX-aQepVahM1SoEfG06yECjnoEIg',
    imgAlt: 'فيلا فاخرة', titleKey: 'home.featured.item2Title', price: '$1.2M',
  },
  {
    id: 'f3',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLsd8xKnUFaAmAC-62H9fY8gRyJqkMK95ilrnZkBvmtXgQ7RnCn02VTTSb1ASmlXIEwxKY1HlYYc-5OqK30TlrnJZeJ4_G7PvX1y0-ie6TuP-VXKZpJkQok7g3s3uGq9eNkxDBDWRxOyATAa9Eal7864mbBmTpCamL0gvgu7t76o3sYzVreHzLSm3RiGesXWjcR-3JhYX3psmBViPfSSKdzcoZJIl3wN_3yCzX36jnorjpQnJatK45FOPw',
    imgAlt: 'فستان مصمم', titleKey: 'home.featured.item3Title', price: '$850',
  },
  {
    id: 'f4',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLsNCuOTl0bHIbRzayCP1i2NV97MpEzhv6-X7487scdHc8UY8Zhl1tVj3KJiagW7sKcOq3SP4sK0ffvkVeQgmBZWhpHCeFxfgLDp6ESd8eIfwjy_4iCebVdAl-FK9RUW_MszRt6dBXWnv_2Ee8tjJwD6eBa8D_5y7fncl3Tu1_TwE9zmulVgVZ0UQpiVDHQ04-HfidO3MkmojC-9i_EiO6wLB9egGPgIvsed0K742sfupasCadR_Fbq8',
    imgAlt: 'سيدان فاخرة', titleKey: 'home.featured.item4Title', price: '$45,000',
  },
  {
    id: 'f5',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLtEUw6-qlL4o6Qccuslz1ZFGyo83z47nMN7FSEUDCYEw7AmquNAI3tN3jdpOMpDsahuSh4II8mz0ZnUIegHIHyRkB7kcJt1_GZ5q7NxVHab9PlnvnbrC0HmMGwXcGNLsd-mdIcumjQK-ll095WLGyg2Bbgaj5xGVewZsvspEwrQ8K8C_hDg-3vjVh_luRgh55lpnUtP27RbO7Ot7bGWqQkJj5ZzWL2PA9F7s2rfdBrw-Gw7uq23XYKJ5w',
    imgAlt: 'بدلة فاخرة', titleKey: 'home.featured.item1Title', price: '$599',
  },
  {
    id: 'f6',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLsd8xKnUFaAmAC-62H9fY8gRyJqkMK95ilrnZkBvmtXgQ7RnCn02VTTSb1ASmlXIEwxKY1HlYYc-5OqK30TlrnJZeJ4_G7PvX1y0-ie6TuP-VXKZpJkQok7g3s3uGq9eNkxDBDWRxOyATAa9Eal7864mbBmTpCamL0gvgu7t76o3sYzVreHzLSm3RiGesXWjcR-3JhYX3psmBViPfSSKdzcoZJIl3wN_3yCzX36jnorjpQnJatK45FOPw',
    imgAlt: 'فستان مصمم', titleKey: 'home.featured.item3Title', price: '$850',
  },
];

export function FeaturedMarquee() {
  const { t } = useTranslation();
  // Duplicate for seamless loop
  const items = [...FEATURED, ...FEATURED];

  return (
    <section
      id="featured-marquee-section"
      data-ui-id={HOME.FEATURED_MARQUEE.CONTAINER.id}
      data-ui-path={HOME.FEATURED_MARQUEE.CONTAINER.path}
      data-ui-feature={HOME.FEATURED_MARQUEE.CONTAINER.feature}
      className="space-y-3 overflow-hidden reveal active"
    >
      {/* Section Header */}
      <div className="flex justify-between items-center">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm"
          style={{
            background: 'rgba(251,188,5,0.10)',
            borderColor: 'rgba(251,188,5,0.40)',
          }}
        >
          <Sparkles
            className="animate-pulse-gova"
            style={{ color: 'var(--gova-google-yellow)', width: '20px', height: '20px' }}
          />
          <h3
            className="font-bold"
            style={{
              color: 'var(--gova-on-surface)',
              fontSize: '20px',
              lineHeight: '28px',
              fontWeight: '600',
            }}
          >
            {t('home.featured.title')}
          </h3>
        </div>
      </div>

      {/* Marquee strip */}
      <div
        className="relative flex overflow-hidden py-4 border-y"
        style={{
          background: 'var(--gova-surface-container-low)',
          borderColor: 'rgba(195,198,213,0.30)',
        }}
      >
        <div className="flex gap-4 animate-marquee-cards whitespace-nowrap pr-4">
          {items.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex-none w-40 rounded-xl p-2 shadow-sm border"
              style={{
                background: 'var(--gova-surface-container-lowest)',
                borderColor: 'rgba(195,198,213,0.30)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imgSrc}
                alt={item.imgAlt}
                className="w-full aspect-square object-cover rounded-lg mb-2"
              />
              <p
                className="truncate font-bold"
                style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gova-on-surface)' }}
              >
                {t(item.titleKey)}
              </p>
              <p
                className="font-bold"
                style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gova-google-blue)' }}
              >
                {item.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
