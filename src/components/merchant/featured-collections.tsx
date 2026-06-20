'use client';
import { ChevronRight, Package } from 'lucide-react';
import Image from 'next/image';

import type { Collection } from '@/lib/merchant/types';
import { MERCHANT, useTranslation } from '@/platform/ui';

interface FeaturedCollectionsProps {
  collections: Collection[];
  className?: string;
}

const typeColors: Record<string, string> = {
  fashion: 'bg-info-container text-on-info-container border-info',
  seasonal: 'bg-warning-container text-on-warning-container border-warning',
  trending: 'bg-tertiary-container text-on-tertiary-container border-tertiary',
};

export function FeaturedCollections({ collections, className }: FeaturedCollectionsProps) {
  const { t } = useTranslation();
  return (
    <section data-ui-uuid={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.CONTAINER.uuid} className={className}>
      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_COLLECTIONS_TITLE_CONTAINER_L25.uuid} className="flex items-center justify-between mb-4">
        <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.TITLE.uuid} className="text-xl font-semibold tracking-tight">{t(MERCHANT.MERCHANT_PROFILE.COLLECTIONS.TITLE)}</h2>
        <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.VIEW_ALL_BUTTON.uuid} className="gap-1 text-sm">
          {t(MERCHANT.MERCHANT_PROFILE.COLLECTIONS.VIEW_ALL)} <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_COLLECTIONS_ITEMS_CONTAINER_L32.uuid} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((collection) => (
          <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.COLLECTION_CARD.uuid} data-ui-instance-id={collection.id} key={collection.id} className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_COLLECTIONS_ITEMS_CONTAINER_L35.uuid} className="relative aspect-[4/3] overflow-hidden">
              <Image data-ui-uuid={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.COLLECTION_IMAGE.uuid} data-ui-instance-id={collection.id} src={collection.coverImage} alt={collection.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_COLLECTIONS_ITEMS_CONTAINER_L37.uuid} className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.COLLECTION_TYPE_BADGE.uuid} data-ui-instance-id={collection.id} className={`absolute top-3 left-3 capitalize ${typeColors[collection.type]}`}>
                {collection.type}
              </span>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_COLLECTIONS_ITEMS_CONTAINER_L41.uuid} className="absolute bottom-3 left-3 right-3">
                <h3 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.COLLECTION_NAME.uuid} data-ui-instance-id={collection.id} className="font-semibold text-lg text-foreground">{collection.name}</h3>
                <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_COLLECTIONS_ITEMS_CONTAINER_L43.uuid} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.COLLECTION_ITEM_COUNT.uuid} data-ui-instance-id={collection.id}>{collection.itemCount} {t(MERCHANT.MERCHANT_PROFILE.COLLECTIONS.ITEMS)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedCollections;
