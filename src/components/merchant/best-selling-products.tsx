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

    <section className={className}>

      <div className="flex items-center justify-between mb-4">

        <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.TITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.BEST_SELLERS.TITLE.uuid}`} className="text-xl font-semibold tracking-tight">{t('merchant.best-sellers.title')}</h2>

        <button className="gap-1 text-sm">

          {t('merchant.best-sellers.viewAll')} <ChevronRight className="h-4 w-4" />

        </button>

      </div>



      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        {products.map((product) => (

          <div data-ui-instance-id={product.id} key={product.id} className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg">

            <div className="relative aspect-square overflow-hidden">

              <Image data-ui-instance-id={product.id} src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />

              {product.originalPrice && (

                <span data-ui-instance-id={product.id} className="absolute top-2 left-2 bg-error">

                  {Math.round(

                    ((product.originalPrice - product.price) / product.originalPrice) * 100

                  )}

                  {t('merchant.best-sellers.percentOff')}

                </span>

              )}

              <div className="absolute bottom-2 left-2">

                <span data-ui-instance-id={product.id} className={`bg-background/80 backdrop-blur-sm ${product.stockStatus === 'out_of_stock' ? 'border-error text-error' : ''}`}>

                  <Package

                    className={`mr-1 h-3 w-3 ${product.stockStatus === 'out_of_stock' ? 'text-error' : product.stockStatus === 'low_stock' ? 'text-warning' : 'text-success'}`}

                  />

                  <span className="capitalize text-xs">{product.stockStatus.replace('_', ' ')}</span>

                </span>

              </div>

            </div>



            <div className="p-3">

              <h3 data-ui-instance-id={product.id} className="mb-2 line-clamp-2 text-sm font-medium leading-tight">{product.name}</h3>

              <div className="mb-2 flex items-baseline gap-2">

                <span className="text-lg font-bold">{formatCurrency(product.price)}</span>

                {product.originalPrice && (

                  <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.originalPrice)}</span>

                )}

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-1">

                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />

                  <span data-ui-instance-id={product.id} className="text-sm font-medium">{product.rating}</span>

                  <span className="text-xs text-muted-foreground">({product.reviewCount})</span>

                </div>

                <span className="text-xs text-muted-foreground">{product.salesCount.toLocaleString()} {t('merchant.best-sellers.sold')}</span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>

  );

}



export default BestSellingProducts;

