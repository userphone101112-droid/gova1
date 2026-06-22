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
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.COLLECTIONS.TITLE.uuid} className="text-xl font-semibold tracking-tight">{t(MERCHANT.MERCHANT_PROFILE.COLLECTIONS.TITLE)}</h2>
        <button className="gap-1 text-sm">
          {t(MERCHANT.MERCHANT_PROFILE.COLLECTIONS.VIEW_ALL)} <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((collection) => (
          <div data-ui-instance-id={collection.id} key={collection.id} className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image data-ui-instance-id={collection.id} src={collection.coverImage} alt={collection.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <span data-ui-instance-id={collection.id} className={`absolute top-3 left-3 capitalize ${typeColors[collection.type]}`}>
                {collection.type}
              </span>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 data-ui-instance-id={collection.id} className="font-semibold text-lg text-foreground">{collection.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span data-ui-instance-id={collection.id}>{collection.itemCount} {t(MERCHANT.MERCHANT_PROFILE.COLLECTIONS.ITEMS)}</span>
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
