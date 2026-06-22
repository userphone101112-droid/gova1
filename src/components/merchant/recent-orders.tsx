'use client';
import { ChevronRight, Clock } from 'lucide-react';
import Image from 'next/image';


import type { Order } from '@/lib/merchant/types';
import { formatCurrency, formatRelativeTime } from '@/lib/merchant/utils';
import { MERCHANT, useTranslation } from '@/platform/ui';


interface RecentOrdersProps {
  orders: Order[];
  className?: string;
}

export function RecentOrders({ orders, className }: RecentOrdersProps) {
  const { t } = useTranslation();
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-muted p-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.TITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.TITLE.uuid}`} className="text-lg">{t('merchant.recent-orders.title')}</h2>
          </div>
          <button className="gap-1 text-sm">
            {t('merchant.recent-orders.viewAll')} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="divide-y">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
            <div className="h-10 w-10 rounded-full overflow-hidden relative">
              <Image data-ui-instance-id={order.id} src={order.customer.avatar} alt={order.customer.name} fill className="object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span data-ui-instance-id={order.id} className="font-medium text-sm truncate">{order.customer.name}</span>
                <span data-ui-instance-id={order.id} className="text-sm text-muted-foreground">{order.items} {order.items > 1 ? t('merchant.recent-orders.items') : t('merchant.recent-orders.item')}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span data-ui-instance-id={order.id} className="text-xs text-muted-foreground font-mono">{order.id}</span>
                <span data-ui-instance-id={order.id} className="text-xs text-muted-foreground">{formatRelativeTime(order.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <span data-ui-instance-id={order.id} className="font-semibold text-sm">{formatCurrency(order.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentOrders;
