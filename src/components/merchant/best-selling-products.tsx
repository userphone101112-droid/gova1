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
  UiSpan,
  MERCHANT,
  COMMON_LAYOUT,
  COMMON_TYPOGRAPHY,
  COMMON_COMPONENTS,
  COMMON_FORMS,
  COMMON_MEDIA,
  useTranslation,
} from '@/platform/ui';
import type { Product } from '@/lib/merchant/types';
import { formatCurrency } from '@/lib/merchant/utils';
import { ChevronRight, Star, Package } from 'lucide-react';

interface BestSellingProductsProps {
  products: Product[];
  className?: string;
}

export function BestSellingProducts({ products, className }: BestSellingProductsProps) {
  const { t } = useTranslation();
  return (
    <UiSection ui={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.CONTAINER} className={className}>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center justify-between mb-4">
        <UiH2 ui={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.TITLE} className="text-xl font-semibold tracking-tight">{t(MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.TITLE)}</UiH2>
        <UiButton ui={COMMON_FORMS.BUTTON} variant="ghost" size="sm" className="gap-1 text-sm">
          {t(MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.VIEW_ALL)} <ChevronRight className="h-4 w-4" />
        </UiButton>
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {products.map((product) => (
          <UiCard
            key={product.id}
            ui={COMMON_COMPONENTS.CARD.CONTAINER}
            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="relative aspect-square overflow-hidden">
              <UiImage
                ui={COMMON_MEDIA.IMG}
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.originalPrice && (
                <UiBadge ui={COMMON_COMPONENTS.BADGE.LABEL} className="absolute top-2 left-2 bg-red-500">
                  {Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  )}
                  {t(MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.PERCENT_OFF)}
                </UiBadge>
              )}
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="absolute bottom-2 left-2">
                <UiBadge
                  ui={COMMON_COMPONENTS.BADGE.LABEL}
                  variant="outline"
                  className={`bg-background/80 backdrop-blur-sm ${product.stockStatus === 'out_of_stock' ? 'border-red-500 text-red-600' : ''}`}
                >
                  <Package
                    className={`mr-1 h-3 w-3 ${product.stockStatus === 'out_of_stock' ? 'text-red-600' : product.stockStatus === 'low_stock' ? 'text-yellow-500' : 'text-green-600'}`}
                  />
                  <UiSpan ui={COMMON_LAYOUT.SPAN} className="capitalize text-xs">{product.stockStatus.replace('_', ' ')}</UiSpan>
                </UiBadge>
              </UiDiv>
            </UiDiv>

            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-3">
              <UiH3 ui={COMMON_TYPOGRAPHY.H3} className="mb-2 line-clamp-2 text-sm font-medium leading-tight">{product.name}</UiH3>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="mb-2 flex items-baseline gap-2">
                <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-lg font-bold">{formatCurrency(product.price)}</UiSpan>
                {product.originalPrice && (
                  <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-sm text-muted-foreground line-through">{formatCurrency(product.originalPrice)}</UiSpan>
                )}
              </UiDiv>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center justify-between">
                <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
                  <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm font-medium">{product.rating}</UiLabel>
                  <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-xs text-muted-foreground">({product.reviewCount})</UiSpan>
                </UiDiv>
                <UiSpan ui={COMMON_LAYOUT.SPAN} className="text-xs text-muted-foreground">{product.salesCount.toLocaleString()} {t(MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.SOLD)}</UiSpan>
              </UiDiv>
            </UiDiv>
          </UiCard>
        ))}
      </UiDiv>
    </UiSection>
  );
}

export default BestSellingProducts;
