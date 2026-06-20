'use client';

import {
  UiSection,
  UiDiv,
  UiH2,
  UiButton,
  UiCard,
  UiImage,
  UiH3,
  UiLabel,
  UiBadge,
  MERCHANT,
  COMMON_LAYOUT,
  COMMON_TYPOGRAPHY,
  COMMON_COMPONENTS,
  COMMON_FORMS,
  COMMON_MEDIA,
  useTranslation,
} from '@/platform/ui';
import type { Collection } from '@/lib/merchant/types';
import { ChevronRight, Package } from 'lucide-react';

interface FeaturedCollectionsProps {
  collections: Collection[];
  className?: string;
}

const typeColors: Record<string, string> = {
  fashion: 'bg-blue-100 text-blue-800 border-blue-200',
  seasonal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  trending: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

export function FeaturedCollections({ collections, className }: FeaturedCollectionsProps) {
  const { t } = useTranslation();
  return (
    <UiSection ui={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.CONTAINER} className={className}>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center justify-between mb-4">
        <UiH2 ui={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.TITLE} className="text-xl font-semibold tracking-tight">{t(MERCHANT.MERCHANT_PROFILE.COLLECTIONS.TITLE)}</UiH2>
        <UiButton ui={COMMON_FORMS.BUTTON} variant="ghost" size="sm" className="gap-1 text-sm">
          {t(MERCHANT.MERCHANT_PROFILE.COLLECTIONS.VIEW_ALL)} <ChevronRight className="h-4 w-4" />
        </UiButton>
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((collection) => (
          <UiCard
            key={collection.id}
            ui={COMMON_COMPONENTS.CARD.CONTAINER}
            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="relative aspect-[4/3] overflow-hidden">
              <UiImage
                ui={COMMON_MEDIA.IMG}
                src={collection.coverImage}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <UiBadge
                ui={COMMON_COMPONENTS.BADGE.LABEL}
                variant="outline"
                className={`absolute top-3 left-3 capitalize ${typeColors[collection.type]}`}
              >
                {collection.type}
              </UiBadge>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="absolute bottom-3 left-3 right-3">
                <UiH3 ui={COMMON_TYPOGRAPHY.H3} className="font-semibold text-lg text-foreground">{collection.name}</UiH3>
                <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <UiLabel ui={COMMON_TYPOGRAPHY.P}>{collection.itemCount} {t(MERCHANT.MERCHANT_PROFILE.COLLECTIONS.ITEMS)}</UiLabel>
                </UiDiv>
              </UiDiv>
            </UiDiv>
          </UiCard>
        ))}
      </UiDiv>
    </UiSection>
  );
}

export default FeaturedCollections;
