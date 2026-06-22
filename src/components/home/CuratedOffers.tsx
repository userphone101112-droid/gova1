'use client';
import { Heart, ShoppingCart, Tag } from 'lucide-react';
import Image from 'next/image';

import { shouldUseUnoptimizedImage } from '@/lib/images/external-image';
import { useTranslation, type TranslationKey, HOME } from '@/platform/ui';


const PRODUCTS: Array<{
  id: string;
  categoryKey: TranslationKey;
  titleKey: TranslationKey;
  priceKey: TranslationKey;
  favId: string;
  addId: string;
  favFilled: boolean;
  img: string;
}> = [
  {
    id: 'product-card-shoes',
    categoryKey: 'home.curated.product1Category',
    titleKey: 'home.curated.product1Title',
    priceKey: 'home.curated.product1Price',
    favId: 'product-fav-shoes',
    addId: 'product-add-shoes',
    favFilled: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrrlu99AXxpnySoT0CXYw9jmKXJlE8qHqsMW1lJVDxmYSToTATqZXQvuXCOhwTya7swIst2AXOqUCCMfgK_qFI4pxUxDFj4qM_S5hznXyZU8MdEBJKZC1edrKvH_yyEIgLclSkn5PiAqJMWRWKC4VXMJtSkmsoKp9M1Jo9B8Jsv5CS9lZyYodd0ot0N1F_0l4GqESjaQQsBVYw7I1gfb3prR6qC3fk7-rdhL3SBDvmvwsoEAXx4DvTfiphjTbv1R0GZ3AxnAkyAA',
  },
  {
    id: 'product-card-medical',
    categoryKey: 'home.curated.product2Category',
    titleKey: 'home.curated.product2Title',
    priceKey: 'home.curated.product2Price',
    favId: 'product-fav-medical',
    addId: 'product-add-medical',
    favFilled: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo-uZJ3G_TOs_xEN_x7AFlRAbn748BtDQ7B7NZnFvlElLXyePimeSnmYAAwF_3V67GbgKV9ntlPetPaYWBRckRohk6On9zpwjFognTvPkW4nvfqf5JJ21annvYIF8XhzOPL8k53g0TMHFLcF3SzPj_iku_i-YDhmckPDJfUbXHXGggvojKKEBviDpry1_A_CmRSEdQ5i6EBztnfSS8Th7BKO_R-2LsEy3zqVH1RkOhGNpV8VmSJ4a70HK2KBwoVm88T4ye_HnT-Q',
  },
  {
    id: 'product-card-phone',
    categoryKey: 'home.curated.product3Category',
    titleKey: 'home.curated.product3Title',
    priceKey: 'home.curated.product3Price',
    favId: 'product-fav-phone',
    addId: 'product-add-phone',
    favFilled: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3TBP9OU-QGRFRmOtRCgH3QdTHznS6H8wly6vvsdal9hOWO_JehYnsOoF9F7GdKsCGBDs-CbucOw22KgU0MDec0DFz5I9nQ9nJi5immslfnhvvEfgAPtMmd2XeD4HN-HCkFN3v0T6S1gclHHFsLVTBhTByDjTByLEkqylRaiscsUJJNBU8b_Gmb-E2Mv1p5vg0lIIaMoUTXzB8NQQZq2Nybrb8_OFQqTvS-ZePZEI4mMOFjVpwY_eXoxcsv3WG8U8jEd8ZyNxYpw',
  },
  {
    id: 'product-card-watch',
    categoryKey: 'home.curated.product4Category',
    titleKey: 'home.curated.product4Title',
    priceKey: 'home.curated.product4Price',
    favId: 'product-fav-watch',
    addId: 'product-add-watch',
    favFilled: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgB3Ru4a-PuZX04N9ND714YTfyjcUMEcPmb5FW2tXf_RHEV2CZtWP0M0mvHAFx6xReMqaCD3lJh9OVbHQQAm2s2s6yDah_mVqwOMh5IEtUtUCAVsZY1jL-yw5Bh6lUooj3dHkPlzsq-OAUPDsttgGALzSPbAm1v55CvVUhZcbiSUhlftmaGQr6bgoYFsFCfJD_hJRwlyrfOWbCBrb_R6piuurxECLkm5I5j1auBdh7QMam-E-fxZKvahaFZv1g_COu0OCBpSuzqg',
  },
];

export function CuratedOffers() {
  const { t } = useTranslation();

  return (
    <section id="curated-offers-section" className="reveal active space-y-4">
      {/* Section header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Tag size={24} style={{ color: 'var(--gova-primary)' }} />
          <h3 data-ui-uuid={HOME.CURATED_OFFERS.SECTION_TITLE.uuid} className="text-xl font-bold" style={{ color: 'var(--gova-on-surface)' }}>
            {t(HOME.CURATED_OFFERS.SECTION_TITLE)}
          </h3>
        </div>
        <span data-ui-uuid={HOME.CURATED_OFFERS.PROMO_TAG.uuid} id="promo-tag-badge" className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--gova-warning)', color: 'var(--gova-on-warning)' }}>
          {t(HOME.CURATED_OFFERS.PROMO_TAG)}
        </span>
      </div>

      {/* Responsive product grid */}
      <div id="product-grid-display" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {PRODUCTS.map(p => (
          <article key={p.id} id={p.id} className="rounded-xl overflow-hidden shadow-sm border transition-all active:scale-95" style={{
        background: 'var(--gova-surface-container-lowest)',
        borderColor: 'var(--gova-outline-variant)',
    }}>
            <div className="relative aspect-square">
              <Image src={p.img} alt={t(p.titleKey)} fill className="object-cover transition-transform active:scale-110" unoptimized={shouldUseUnoptimizedImage(p.img)} />
              <button data-ui-uuid={HOME.CURATED_OFFERS.ADD_TO_FAVORITES.uuid} id={p.favId} className="absolute top-2 start-2 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur flex items-center justify-center shadow-sm transition-transform active:scale-90" aria-label={t(HOME.CURATED_OFFERS.ADD_TO_FAVORITES)} style={{ color: p.favFilled ? 'var(--gova-error)' : 'var(--gova-on-surface-variant)' }}>
                <Heart
                  size={18}
                  fill={p.favFilled ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            <div className="p-3 space-y-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--gova-success)' }}>
                {t(p.categoryKey)}
              </span>
              <span className="text-sm font-bold truncate" style={{ color: 'var(--gova-on-surface)' }}>
                {t(p.titleKey)}
              </span>
              <div className="flex justify-between items-center pt-1">
                <span className="text-base font-bold" style={{ color: 'var(--gova-primary)' }}>
                  {t(p.priceKey)}
                </span>
                <button data-ui-uuid={HOME.CURATED_OFFERS.ADD_TO_CART.uuid} id={p.addId} className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform active:scale-90" style={{ background: 'var(--gova-primary)', color: 'var(--gova-on-primary)' }} aria-label={t(HOME.CURATED_OFFERS.ADD_TO_CART)}>
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Show More Button */}
      <div className="flex justify-center pt-2">
        <button data-ui-uuid={HOME.CURATED_OFFERS.SHOW_MORE.uuid} id="curated-offers-show-more" className="px-6 py-2 rounded-full font-bold text-sm border transition-transform active:scale-95" style={{
        background: 'var(--gova-surface-container-low)',
        borderColor: 'var(--gova-outline-variant)',
        color: 'var(--gova-primary)',
    }}>
          {t(HOME.CURATED_OFFERS.SHOW_MORE)}
        </button>
      </div>
    </section>
  );
}
