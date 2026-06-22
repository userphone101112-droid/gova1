'use client';
import { Package, ShoppingBag, Users, Star, DollarSign, TrendingUp, MessageCircle } from 'lucide-react';

import type { MerchantOverview as MerchantOverviewType } from '@/lib/merchant/types';
import { formatCurrency, formatCompactNumber } from '@/lib/merchant/utils';
import { MERCHANT, useTranslation } from '@/platform/ui';



interface MerchantOverviewProps {
  overview: MerchantOverviewType;
  className?: string;
}

const overviewCards = [
  { key: 'productsCount', label: MERCHANT.MERCHANT_PROFILE.OVERVIEW.PRODUCTS, icon: Package, format: 'number' },
  { key: 'ordersCount', label: MERCHANT.MERCHANT_PROFILE.OVERVIEW.ORDERS, icon: ShoppingBag, format: 'number' },
  { key: 'customersCount', label: MERCHANT.MERCHANT_PROFILE.OVERVIEW.CUSTOMERS, icon: Users, format: 'number' },
  { key: 'rating', label: MERCHANT.MERCHANT_PROFILE.OVERVIEW.RATING, icon: Star, format: 'rating' },
  { key: 'revenue', label: MERCHANT.MERCHANT_PROFILE.OVERVIEW.REVENUE, icon: DollarSign, format: 'currency' },
  { key: 'completionRate', label: MERCHANT.MERCHANT_PROFILE.OVERVIEW.COMPLETION_RATE, icon: TrendingUp, format: 'percentage' },
  { key: 'responseRate', label: MERCHANT.MERCHANT_PROFILE.OVERVIEW.RESPONSE_RATE, icon: MessageCircle, format: 'percentage' },
] as const;

export function MerchantOverview({ overview, className }: MerchantOverviewProps) {
  const { t } = useTranslation();
  return (
    <section className={className}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {overviewCards.map(({ key, label, icon: Icon, format }) => {
          const value = overview[key as keyof MerchantOverviewType];
          let displayValue: string;

          switch (format) {
            case 'currency':
              displayValue = formatCurrency(value as number);
              break;
            case 'percentage':
              displayValue = `${value}%`;
              break;
            case 'rating':
              displayValue = (value as number).toFixed(1);
              break;
            case 'number':
              displayValue = formatCompactNumber(value as number);
              break;
            default:
              displayValue = String(value);
          }

          return (
            <div data-ui-instance-id={key} key={key} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="flex flex-col items-center justify-center p-4 sm:p-6">
                <div className="mb-3 rounded-full bg-muted p-2.5 transition-colors group-hover:bg-primary/10">
                  <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <span className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {displayValue}
                </span>
                <span data-ui-instance-id={key} className="mt-1 text-center text-xs text-muted-foreground sm:text-sm">
                  {t(label)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MerchantOverview;
