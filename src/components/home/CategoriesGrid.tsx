'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';

const CATEGORIES = [
  { id: 'category-item-fashion',    labelKey: 'home.categories.fashion',     img: 'https://lh3.googleusercontent.com/aida/AP1WRLsgtZzPqQF8qj-DiQKYE86EIBmmBRZVztf31LByeblQApGZWD0d0iZ-WrT_3lk2gq8C9N6xiQdiNdrBgsMQE_qW7E1nGexODZ6BSeUxSG4A1aJ-4BLugFMUAVz7lCZH8wi1Bc97971NcLRlibUz260qfQ3OoTahX3ryfKxADALFIl-oObPHtIUurVVkJJAvqBtFg9ujC4H8rb4Qy3_keUw4-tWPqMrH6ORY82V-XvhbFHh3nxW8qWvi3A' },
  { id: 'category-item-cars',       labelKey: 'home.categories.cars',        img: 'https://lh3.googleusercontent.com/aida/AP1WRLt_QHASCj4dB-in6ocCQPcsnkfqnXhgSkTHLrfkwEZ33SrbxRoGVFeOmtEmq2uIslL3RrBByikT8aPjiy8x8rhI0XIYnpCrKQbA9Upe3kPoW2kC104BgfLq0U_whn99XvEGu0DZhXanXxOJwgXiv2Xqi7cSchl4AfHkJUd9_3kCF3cQAo6OTZdlutFVSOFSuZLMnWivrifQoJR7Kq2Xhcs-g_MGn3Ixg2OHQytdiW6r0vxHVMMDs791oQ' },
  { id: 'category-item-realestate', labelKey: 'home.categories.realEstate',  img: 'https://lh3.googleusercontent.com/aida/AP1WRLviJKEzNj5O3szQyiiMOFYN5bTLlY84ez7aSiImrwY0HivS7FHIEANp1nr_fgrtJHR6LTMcoGuQ3qowcAiMbyjDhdY2Po6aa6wNqdkxrUVTWJ_xEvzc4qdfjrurOQStMajPl3obgSHeX5JUPma_43KfT_1q54qVCQlm9evFkrPeEJBNImF7Xd2xe355-hgysUpJDstGX_4pzskHwJXSd0TAQvK1H1LX-aQepVahM1SoEfG06yECjnoEIg' },
  { id: 'category-item-medical',    labelKey: 'home.categories.medical',     img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeGdzeUkW8JQecWz-M2fqfhozSTiIdxZqjKdim7MjQiEMyala2DBZ76WYV_BnhAwdglxkstKQBdZW4TV3I5qtkbDYC5_ReU4DvlBeq5zdL2orQ4nd_HrP7oxDpUsWrFmAWMMiuIxynKfEzcXyQBN2Xw9P--hl5Xk7TVTYKY0BxSqkHYg7A50chXWVVzu355P4CUTDF_OaeRU6j24oev1hQ_uF59ZF8QGHnAeI5tN8Kt5t8d4KKjC_s82TWkT4lEkfKoJTd8Nnm9g' },
  { id: 'category-item-pharmacy',   labelKey: 'home.categories.pharmacy',    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwR_P7enT0h2VqWj6l-V8_vxJHuPQxZxOIoPfgnE9vwBTfeP1eT8Fi0xt8vQ7KtxHtjYek4zO5ErSA_Rq3GTpKrGwE0V25RZpXpKqQcI9a19_MO0uz0bVF_b04WXiy9oS_-5tZT9SjM5SGXp81RkCy6sIY0B5q659xqkgDbrTFiZcwmz0GxHGLHcBDFLVxhwK5dN1ivPCBTmQUZr_HGIE2w1knK9qE2W0JFT-Z7xHKrRxPZDO_T6NRYoGxQ9ZvTqI_pvAEfPsUug' },
  { id: 'category-item-education',  labelKey: 'home.categories.education',   img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXcxTngdeDHTcnk7mMopO-xWV3IvOcAfFG0Py2XhJ7AYRia7zyigcenoBKEihcZgDXkb9S3U8s_zeFWxLopaojs5YWIynYhj7gyngsEZiJPTFiOw3MJH6btokE-xAaZ41MNsN1RUFBlBj8fWkZU12cos-zBWpZ9HhYjE27hu5veBnmKRmiYNiZFUkBz_r6tF1nDslLSSd2Wk_zyK9la2XGTIMsXEvTjUUVEYJGtrhIM00gOkbjSMjo-cKR45KtrcP1zQzH1uvz6A' },
  { id: 'category-item-electronics',labelKey: 'home.categories.electronics', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbLhjiTpxSRka2P-TeKL8hdhcTmEQ5Mh_D6XxXykvYA5Xljf9L8S16Om08WsGojBc-_lYmAGdoGSGIttwvkrKmukVPbXlloQlk9j_QoFrBeNUDAjHFsUg2GuaFGQzuIgm10JVN1UgdQkJlLT8nSPlz7VJuhnrW6vOcsaOK0wiwBnEhmwIseWjxJqu9jhqbUm9PYNfLjNfgx1f3tpcJJXidhFNXFFnbpa3m8MsM6dwofGrMX2q-U_67MzZWyw2V9Imb9-d8Z9cbCQ' },
  { id: 'category-item-industrial', labelKey: 'home.categories.industrial',  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjeQ3UzNv88JQVmOeLGSuB5MijJhfXQGjoar90QB4jWOXD1SOrdHnNouGvbj_eq2rKKjEolnfCgZXCtdFzS9ubL0_jKCkeQL_q-jVkggGUGir4CHY5_1_cVzCGABotL0fdC8mycOET56qmm5xcTFHA1MCeE50Jz2yzkyqi6WJaj3o3U8c5SeAixVOtH4WhILldE39Ee0_VuMAf9WlKlEBepTUaUoF9cKPUWoJM0ZkM-C4qj_d6ysD5h9EnyuUgzSXHF-aZKb6Asg' },
];

export function CategoriesGrid() {
  const { t } = useTranslation();

  return (
    <section id="categories-section" className="reveal active">
      {/* Header row */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--gova-primary)' }}>
            {"storefront"}
          </span>
          <h3
            id="categories-section-title"
            className="text-xl font-bold"
            style={{ color: 'var(--gova-on-surface)' }}
          >
            {t('home.categories.title')}
          </h3>
        </div>
        <button
          id="categories-view-all"
          className="flex items-center gap-1 px-4 py-1 rounded-full border text-xs font-semibold transition-transform active:scale-95"
          style={{
            background: 'var(--gova-surface-container-low)',
            borderColor: 'var(--gova-outline-variant)',
            color: 'var(--gova-google-blue)',
          }}
        >
          <span>{t('home.categories.viewAll')}</span>
          <span className="material-symbols-outlined text-base">{"chevron_left"}</span>
        </button>
      </div>

      {/* 4-column grid */}
      <div id="category-grid-container" className="grid grid-cols-4 gap-6 pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            id={cat.id}
            className="flex flex-col items-center gap-2 transition-transform active:scale-95"
          >
            <div
              className="rounded-full overflow-hidden border-2 w-full aspect-square transition-all active:border-blue-400"
              style={{ borderColor: 'transparent', background: 'var(--gova-surface-container)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cat.img} alt={t(cat.labelKey)} className="w-full h-full object-cover" />
            </div>
            <span
              className="text-xs font-semibold text-center"
              style={{ color: 'var(--gova-on-surface-variant)' }}
            >
              {t(cat.labelKey)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
