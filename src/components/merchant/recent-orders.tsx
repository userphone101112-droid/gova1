'use client';

import {
  UiCard,
  UiDiv,
  UiH2,
  UiButton,
  UiLabel,
  UiImage,
  MERCHANT,
  COMMON_LAYOUT,
  COMMON_TYPOGRAPHY,
  COMMON_FORMS,
  COMMON_MEDIA,
  useTranslation,
} from '@/platform/ui';
import type { Order } from '@/lib/merchant/types';
import { formatCurrency, formatRelativeTime } from '@/lib/merchant/utils';
import { ChevronRight, Clock } from 'lucide-react';

interface RecentOrdersProps {
  orders: Order[];
  className?: string;
}

export function RecentOrders({ orders, className }: RecentOrdersProps) {
  const { t } = useTranslation();
  return (
    <UiCard ui={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.CONTAINER} className={`overflow-hidden ${className}`}>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-6">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-row items-center justify-between space-y-0 pb-4">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-muted p-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </UiDiv>
            <UiH2 ui={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.TITLE} className="text-lg">{t(MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.TITLE)}</UiH2>
          </UiDiv>
          <UiButton ui={COMMON_FORMS.BUTTON} variant="ghost" size="sm" className="gap-1 text-sm">
            {t(MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.VIEW_ALL)} <ChevronRight className="h-4 w-4" />
          </UiButton>
        </UiDiv>
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="divide-y">
        {orders.map((order) => (
          <UiDiv
            key={order.id}
            ui={COMMON_LAYOUT.CONTAINER}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
          >
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="h-10 w-10 rounded-full overflow-hidden relative">
              <UiImage
                ui={COMMON_MEDIA.IMG}
                src={order.customer.avatar}
                alt={order.customer.name}
                fill
                className="object-cover"
              />
            </UiDiv>

            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1 min-w-0">
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium text-sm truncate">{order.customer.name}</UiLabel>
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{order.items} {order.items > 1 ? t(MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.ITEMS) : t(MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.ITEM)}</UiLabel>
              </UiDiv>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2 mt-1">
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-xs text-muted-foreground font-mono">{order.id}</UiLabel>
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-xs text-muted-foreground">{formatRelativeTime(order.createdAt)}</UiLabel>
              </UiDiv>
            </UiDiv>

            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-3 sm:gap-4">
              <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-semibold text-sm">{formatCurrency(order.value)}</UiLabel>
            </UiDiv>
          </UiDiv>
        ))}
      </UiDiv>
    </UiCard>
  );
}

export default RecentOrders;
