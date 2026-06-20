'use client';

import { ChevronRight, Star, Package } from 'lucide-react';
import Image from 'next/image';



import type { Product } from '@/lib/merchant/types';
import { formatCurrency } from '@/lib/merchant/utils';
import { MERCHANT, useTranslation } from '@/platform/ui';



interface BestSellingProductsProps {

  products: Product[];

  className?: string;

}



export function BestSellingProducts({ products, className }: BestSellingProductsProps) {

  const { t } = useTranslation();

  return (

    <section data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.CONTAINER.uuid} className={className}>

      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_TITLE_CONTAINER_L27.uuid} className="flex items-center justify-between mb-4">

        <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.TITLE.uuid} className="text-xl font-semibold tracking-tight">{t(MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.TITLE)}</h2>

        <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.VIEW_ALL_BUTTON.uuid} className="gap-1 text-sm">

          {t(MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.VIEW_ALL)} <ChevronRight className="h-4 w-4" />

        </button>

      </div>



      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_PERCENT_OFF_CONTAINER_L34.uuid} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        {products.map((product) => (

          <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.PRODUCT_CARD.uuid} data-ui-instance-id={product.id} key={product.id} className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg">

            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_PERCENT_OFF_CONTAINER_L37.uuid} className="relative aspect-square overflow-hidden">

              <Image data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.PRODUCT_IMAGE.uuid} data-ui-instance-id={product.id} src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />

              {product.originalPrice && (

                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.SALE_BADGE.uuid} data-ui-instance-id={product.id} className="absolute top-2 left-2 bg-error">

                  {Math.round(

                    ((product.originalPrice - product.price) / product.originalPrice) * 100

                  )}

                  {t(MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.PERCENT_OFF)}

                </span>

              )}

              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_PERCENT_OFF_CONTAINER_L47.uuid} className="absolute bottom-2 left-2">

                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.STOCK_BADGE.uuid} data-ui-instance-id={product.id} className={`bg-background/80 backdrop-blur-sm ${product.stockStatus === 'out_of_stock' ? 'border-error text-error' : ''}`}>

                  <Package

                    className={`mr-1 h-3 w-3 ${product.stockStatus === 'out_of_stock' ? 'text-error' : product.stockStatus === 'low_stock' ? 'text-warning' : 'text-success'}`}

                  />

                  <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_PERCENT_OFF_SPAN_L52.uuid} className="capitalize text-xs">{product.stockStatus.replace('_', ' ')}</span>

                </span>

              </div>

            </div>



            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_SOLD_CONTAINER_L57.uuid} className="p-3">

              <h3 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.PRODUCT_NAME.uuid} data-ui-instance-id={product.id} className="mb-2 line-clamp-2 text-sm font-medium leading-tight">{product.name}</h3>

              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_SOLD_CONTAINER_L59.uuid} className="mb-2 flex items-baseline gap-2">

                <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_SOLD_SPAN_L60.uuid} className="text-lg font-bold">{formatCurrency(product.price)}</span>

                {product.originalPrice && (

                  <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_SOLD_SPAN_L62.uuid} className="text-sm text-muted-foreground line-through">{formatCurrency(product.originalPrice)}</span>

                )}

              </div>

              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_SOLD_CONTAINER_L65.uuid} className="flex items-center justify-between">

                <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_SOLD_CONTAINER_L66.uuid} className="flex items-center gap-1">

                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />

                  <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.PRODUCT_RATING.uuid} data-ui-instance-id={product.id} className="text-sm font-medium">{product.rating}</span>

                  <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_SOLD_SPAN_L69.uuid} className="text-xs text-muted-foreground">({product.reviewCount})</span>

                </div>

                <span data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_BEST_SELLERS_SOLD_SPAN_L71.uuid} className="text-xs text-muted-foreground">{product.salesCount.toLocaleString()} {t(MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.SOLD)}</span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>

  );

}



export default BestSellingProducts;

