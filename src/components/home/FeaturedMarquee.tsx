'use client';

import { useTranslation, type TranslationKey } from '@/platform/ui';
import { Sparkles } from 'lucide-react';
import { UiDiv, UiSection, UiHeader, UiImage, UiP } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

const FEATURED: Array<{
  id: string;
  imgSrc: string;
  titleKey: TranslationKey;
  price: string;
}> = [
  {
    id: 'f1',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLtEUw6-qlL4o6Qccuslz1ZFGyo83z47nMN7FSEUDCYEw7AmquNAI3tN3jdpOMpDsahuSh4II8mz0ZnUIegHIHyRkB7kcJt1_GZ5q7NxVHab9PlnvnbrC0HmMGwXcGNLsd-mdIcumjQK-ll095WLGyg2Bbgaj5xGVewZsvspEwrQ8K8C_hDg-3vjVh_luRgh55lpnUtP27RbO7Ot7bGWqQkJj5ZzWL2PA9F7s2rfdBrw-Gw7uq23XYKJ5w',
    titleKey: 'home.featured.item1Title', price: '$599',
  },
  {
    id: 'f2',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLviJKEzNj5O3szQyiiMOFYN5bTLlY84ez7aSiImrwY0HivS7FHIEANp1nr_fgrtJHR6LTMcoGuQ3qowcAiMbyjDhdY2Po6aa6wNqdkxrUVTWJ_xEvzc4qdfjrurOQStMajPl3obgSHeX5JUPma_43KfT_1q54qVCQlm9evFkrPeEJBNImF7Xd2xe355-hgysUpJDstGX_4pzskHwJXSd0TAQvK1H1LX-aQepVahM1SoEfG06yECjnoEIg',
    titleKey: 'home.featured.item2Title', price: '$1.2M',
  },
  {
    id: 'f3',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLsd8xKnUFaAmAC-62H9fY8gRyJqkMK95ilrnZkBvmtXgQ7RnCn02VTTSb1ASmlXIEwxKY1HlYYc-5OqK30TlrnJZeJ4_G7PvX1y0-ie6TuP-VXKZpJkQok7g3s3uGq9eNkxDBDWRxOyATAa9Eal7864mbBmTpCamL0gvgu7t76o3sYzVreHzLSm3RiGesXWjcR-3JhYX3psmBViPfSSKdzcoZJIl3wN_3yCzX36jnorjpQnJatK45FOPw',
    titleKey: 'home.featured.item3Title', price: '$850',
  },
  {
    id: 'f4',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLsNCuOTl0bHIbRzayCP1i2NV97MpEzhv6-X7487scdHc8UY8Zhl1tVj3KJiagW7sKcOq3SP4sK0ffvkVeQgmBZWhpHCeFxfgLDp6ESd8eIfwjy_4iCebVdAl-FK9RUW_MszRt6dBXWnv_2Ee8tjJwD6eBa8D_5y7fncl3Tu1_TwE9zmulVgVZ0UQpiVDHQ04-HfidO3MkmojC-9i_EiO6wLB9egGPgIvsed0K742sfupasCadR_Fbq8',
    titleKey: 'home.featured.item4Title', price: '$45,000',
  },
  {
    id: 'f5',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLtEUw6-qlL4o6Qccuslz1ZFGyo83z47nMN7FSEUDCYEw7AmquNAI3tN3jdpOMpDsahuSh4II8mz0ZnUIegHIHyRkB7kcJt1_GZ5q7NxVHab9PlnvnbrC0HmMGwXcGNLsd-mdIcumjQK-ll095WLGyg2Bbgaj5xGVewZsvspEwrQ8K8C_hDg-3vjVh_luRgh55lpnUtP27RbO7Ot7bGWqQkJj5ZzWL2PA9F7s2rfdBrw-Gw7uq23XYKJ5w',
    titleKey: 'home.featured.item1Title', price: '$599',
  },
  {
    id: 'f6',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLsd8xKnUFaAmAC-62H9fY8gRyJqkMK95ilrnZkBvmtXgQ7RnCn02VTTSb1ASmlXIEwxKY1HlYYc-5OqK30TlrnJZeJ4_G7PvX1y0-ie6TuP-VXKZpJkQok7g3s3uGq9eNkxDBDWRxOyATAa9Eal7864mbBmTpCamL0gvgu7t76o3sYzVreHzLSm3RiGesXWjcR-3JhYX3psmBViPfSSKdzcoZJIl3wN_3yCzX36jnorjpQnJatK45FOPw',
    titleKey: 'home.featured.item3Title', price: '$850',
  },
];

export function FeaturedMarquee() {
  const { t } = useTranslation();
  // Duplicate for seamless loop
  const items = [...FEATURED, ...FEATURED];

  return (
    <UiSection ui={COMMON_LAYOUT.SECTION} id="featured-marquee-section" className="space-y-3 overflow-hidden reveal active">
      {/* Section Header */}
      <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex justify-between items-center">
        <UiDiv ui={COMMON_LAYOUT.WRAPPER}
          className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm"
          style={{
            background: 'var(--gova-warning-container)',
            borderColor: 'var(--gova-warning)',
          }}
        >
          <Sparkles
            className="animate-pulse-gova"
            style={{ color: 'var(--gova-warning)', width: '20px', height: '20px' }}
          />
          <UiHeader ui={COMMON_LAYOUT.HEADER}
            level={3}
            className="font-bold"
            style={{
              color: 'var(--gova-on-surface)',
              fontSize: '20px',
              lineHeight: '28px',
              fontWeight: '600',
            }}
          >
            {t('home.featured.title')}
          </UiHeader>
        </UiDiv>
      </UiDiv>

      {/* Marquee strip */}
      <UiDiv ui={COMMON_LAYOUT.WRAPPER}
        className="relative flex overflow-hidden py-4 border-y"
        style={{
          background: 'var(--gova-surface-container-low)',
          borderColor: 'var(--gova-outline-variant)',
        }}
      >
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex gap-4 animate-marquee-cards whitespace-nowrap pr-4">
          {items.map((item, idx) => (
            <UiDiv
              key={`${item.id}-${idx}`}
              ui={COMMON_LAYOUT.CONTAINER}
              className="flex-none w-40 rounded-xl p-2 shadow-sm border"
              style={{
                background: 'var(--gova-surface-container-lowest)',
                borderColor: 'var(--gova-outline-variant)',
              }}
            >
              <UiImage
                ui={COMMON_LAYOUT.CONTAINER}
                src={item.imgSrc}
                alt={t(item.titleKey)}
                width={160}
                height={160}
                className="w-full aspect-square object-cover rounded-lg mb-2"
              />
              <UiP
                ui={COMMON_LAYOUT.CONTAINER}
                className="truncate font-bold"
                style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gova-on-surface)' }}
              >
                {t(item.titleKey)}
              </UiP>
              <UiP
                ui={COMMON_LAYOUT.CONTAINER}
                className="font-bold"
                style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gova-primary)' }}
              >
                {item.price}
              </UiP>
            </UiDiv>
          ))}
        </UiDiv>
      </UiDiv>
    </UiSection>
  );
}
