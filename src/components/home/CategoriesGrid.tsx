'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { Store, ChevronLeft, ChevronRight } from 'lucide-react';
import { UiButton, UiImage, UiLabel, UiHeader, UiDiv, UiSection } from '@/components/ui';
import { HOME } from '@/shared/ui-registry';
import { DECORATIVE } from '@/shared/ui-registry/categories';

const CATEGORIES = [
  {
    id: 'fashion',
    nameKey: 'home.categories.fashion',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLsgtZzPqQF8qj-DiQKYE86EIBmmBRZVztf31LByeblQApGZWD0d0iZ-WrT_3lk2gq8C9N6xiQdiNdrBgsMQE_qW7E1nGexODZ6BSeUxSG4A1aJ-4BLugFMUAVz7lCZH8wi1Bc97971NcLRlibUz260qfQ3OoTahX3ryfKxADALFIl-oObPHtIUurVVkJJAvqBtFg9ujC4H8rb4Qy3_keUw4-tWPqMrH6ORY82V-XvhbFHh3nxW8qWvi3A',
    imgAlt: 'أزياء',
  },
  {
    id: 'automotive',
    nameKey: 'home.categories.automotive',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLt_QHASCj4dB-in6ocCQPcsnkfqnXhgSkTHLrfkwEZ33SrbxRoGVFeOmtEmq2uIslL3RrBByikT8aPjiy8x8rhI0XIYnpCrKQbA9Upe3kPoW2kC104BgfLq0U_whn99XvEGu0DZhXanXxOJwgXiv2Xqi7cSchl4AfHkJUd9_3kCF3cQAo6OTZdlutFVSOFSuZLMnWivrifQoJR7Kq2Xhcs-g_MGn3Ixg2OHQytdiW6r0vxHVMMDs791oQ',
    imgAlt: 'سيارات',
  },
  {
    id: 'realestate',
    nameKey: 'home.categories.realestate',
    imgSrc: 'https://lh3.googleusercontent.com/aida/AP1WRLviJKEzNj5O3szQyiiMOFYN5bTLlY84ez7aSiImrwY0HivS7FHIEANp1nr_fgrtJHR6LTMcoGuQ3qowcAiMbyjDhdY2Po6aa6wNqdkxrUVTWJ_xEvzc4qdfjrurOQStMajPl3obgSHeX5JUPma_43KfT_1q54qVCQlm9evFkrPeEJBNImF7Xd2xe355-hgysUpJDstGX_4pzskHwJXSd0TAQvK1H1LX-aQepVahM1SoEfG06yECjnoEIg',
    imgAlt: 'عقارات',
  },
  {
    id: 'medical',
    nameKey: 'home.categories.medical',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeGdzeUkW8JQecWz-M2fqfhozSTiIdxZqjKdim7MjQiEMyala2DBZ76WYV_BnhAwdglxkstKQBdZW4TV3I5qtkbDYC5_ReU4DvlBeq5zdL2orQ4nd_HrP7oxDpUsWrFmAWMMiuIxynKfEzcXyQBN2Xw9P--hl5Xk7TVTYKY0BxSqkHYg7A50chXWVVzu355P4CUTDF_OaeRU6j24oev1hQ_uF59ZF8QGHnAeI5tN8Kt5t8d4KKjC_s82TWkT4lEkfKoJTd8Nnm9g',
    imgAlt: 'خدمات طبية',
  },
  {
    id: 'pharmacy',
    nameKey: 'home.categories.pharmacy',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwR_P7enT0h2VqWj6l-V8_vxJHuPQxZxOIoPfgnE9vwBTfeP1eT8Fi0xt8vQ7KtxHtjYek4zO5ErSA_Rq3GTnMrGwE0V25RZpXpKqQcI9a19_MO0uz0bVF_b04WXiy9oS_-5tZT9SjM5SGXp81RkCy6sIY0B5q659xqkgDbrTFiZcwmz0GxHGLHcBDFLVxhwK5dN1ivPCBTmQUZr_HGIE2w1knK9qE2W0JFT-Z7xHKrRxPZDO_T6NRYoGxQ9ZvTqI_pvAEfPsUug',
    imgAlt: 'صيدلية',
  },
  {
    id: 'education',
    nameKey: 'home.categories.education',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXcxTngdeDHTcnk7mMopO-xWV3IvOcAfFG0Py2XhJ7AYRia7zyigcenoBKEihcZgDXkb9S3U8s_zeFWxLopaojs5YWIynYhj7gyngsEZiJPTFiOw3MJH6btokE-xAaZ41MNsN1RUFBlBj8fWkZU12cos-zBWpZ9HhYjE27hu5veBnmKRmiYNiZFUkBz_r6tF1nDslLSSd2Wk_zyK9la2XGTIMsXEvTjUUVEYJGtrhIM00gOkbjSMjo-cKR45KtrcP1zQzH1uvz6A',
    imgAlt: 'تعليم',
  },
  {
    id: 'electronics',
    nameKey: 'home.categories.electronics',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0BFZ0-S-dKVPkpzRHj3TuiHQrYuRMPkGJwuwzfeDCNeMz_oBdqfyCnJLvOuMoXEVWAh33KNPkr_bMuXwUAbJe2MOW0PiWDsJeHb7HMBPiDdXl00CK8rj9Lbm5WJ5B2HXa6RNy3vWH1pqOOZ5GFD0jH84gTiX6xC_GMmGGM1jF8kBN5JevNe2MSWqJJrH0VMa0tpnV-C29WqHSPWaUV9FqtYQqCJi-RN8S0Sk-UWzYNMc6ooA-NibA',
    imgAlt: 'إلكترونيات',
  },
  {
    id: 'food',
    nameKey: 'home.categories.food',
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhpg5GJiVVqfF-I9B4FNXEsEj4s4WflK4Wk8_Y3cbD7O9ZdWmYqnnuFD11ZLAkLLUzh8sMi00jGW-h66M4UNacPMWCFI_hq-5MBkPpnK1FQGFhXpUK5-jFkl0Q8OuODTiimh2kFMFYJuFJzX_ixPh4cbUSrfBRNK10PUFj0e1Rf-fCUvtQ5ykNSk_0sO-8_SXhKEopqeXQ2NR0K7u3OGv4rqVPPRDEuDhGW4Zyh1sJcRQX7F3kG7Q',
    imgAlt: 'مطاعم',
  },
];

export function CategoriesGrid() {
  const { t, locale } = useTranslation();

  return (
    <UiSection ui={DECORATIVE.SPACER} id="categories-section" className="reveal active">
      {/* Section Header */}
      <UiDiv ui={DECORATIVE.SPACER} className="flex justify-between items-end mb-4">
        <UiDiv
          ui={DECORATIVE.SPACER}
          className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm"
          style={{
            background: 'rgba(66,133,244,0.10)',
            borderColor: 'rgba(66,133,244,0.30)',
          }}
        >
          <Store
            className="w-5 h-5"
            style={{ color: 'var(--gova-google-blue)' }}
          />
          <UiHeader
            ui={HOME.CATEGORIES_GRID.SECTION_TITLE}
            level={3}
            className="font-semibold"
            style={{
              color: 'var(--gova-google-blue)',
              fontSize: '20px',
              lineHeight: '28px',
              fontWeight: '600',
            }}
          >
            {t('home.categories.sectionTitle')}
          </UiHeader>
        </UiDiv>
        <UiButton
          ui={HOME.CATEGORIES_GRID.TOGGLE}
          id="view-all-categories"
          className="flex items-center gap-1 px-4 py-1.5 rounded-full border transition-colors active:bg-surface-container"
          style={{
            background: 'var(--gova-surface-container-low)',
            borderColor: 'rgba(195,198,213,0.30)',
            color: 'var(--gova-google-blue)',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          <span>{t('home.categories.viewAll')}</span>
          {locale === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </UiButton>
      </UiDiv>

      {/* Grid responsive column count */}
      <UiDiv ui={DECORATIVE.SPACER} className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 sm:gap-6 pb-2">
        {CATEGORIES.map((cat) => (
          <UiButton
            ui={HOME.CATEGORIES_GRID.ITEM}
            key={cat.id}
            id={`category-${cat.id}`}
            className="flex flex-col items-center gap-2 group"
            aria-label={cat.imgAlt}
          >
            <UiDiv
              ui={DECORATIVE.SPACER}
              className="rounded-full overflow-hidden border-2 border-transparent group-active:border-googleBlue transition-all w-full aspect-square relative"
              style={{ background: 'var(--gova-surface-container)' }}
            >
              <UiImage
                ui={HOME.CATEGORIES_GRID.CATEGORY_IMAGE}
                src={cat.imgSrc}
                alt={cat.imgAlt}
                fill
                className="object-cover"
              />
            </UiDiv>
            <UiLabel
              ui={HOME.CATEGORIES_GRID.CATEGORY_NAME}
              className="text-center"
              style={{
                color: 'var(--gova-on-surface-variant)',
                fontSize: '12px',
                fontWeight: '600',
                lineHeight: '16px',
              }}
            >
              {t(cat.nameKey)}
            </UiLabel>
          </UiButton>
        ))}
      </UiDiv>
    </UiSection>
  );
}
