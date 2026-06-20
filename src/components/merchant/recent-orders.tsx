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
    <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.CONTAINER.uuid} className={`overflow-hidden ${className}`}>
      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L20.uuid} className="p-6">
        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L21.uuid} className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L22.uuid} className="flex items-center gap-2">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L23.uuid} className="rounded-full bg-muted p-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.TITLE.uuid} className="text-lg">{t(MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.TITLE)}</h2>
          </div>
          <button data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.VIEW_ALL_BUTTON.uuid} className="gap-1 text-sm">
            {t(MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.VIEW_ALL)} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L34.uuid} className="divide-y">
        {orders.map((order) => (
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L36.uuid} key={order.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L37.uuid} className="h-10 w-10 rounded-full overflow-hidden relative">
              <Image data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.ORDER_AVATAR.uuid} data-ui-instance-id={order.id} src={order.customer.avatar} alt={order.customer.name} fill className="object-cover" />
            </div>

            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L41.uuid} className="flex-1 min-w-0">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L42.uuid} className="flex items-center gap-2">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.CUSTOMER_NAME.uuid} data-ui-instance-id={order.id} className="font-medium text-sm truncate">{order.customer.name}</span>
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.ITEMS_TEXT.uuid} data-ui-instance-id={order.id} className="text-sm text-muted-foreground">{order.items} {order.items > 1 ? t(MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.ITEMS) : t(MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.ITEM)}</span>
              </div>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L46.uuid} className="flex items-center gap-2 mt-1">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.ORDER_ID.uuid} data-ui-instance-id={order.id} className="text-xs text-muted-foreground font-mono">{order.id}</span>
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.ORDER_TIME.uuid} data-ui-instance-id={order.id} className="text-xs text-muted-foreground">{formatRelativeTime(order.createdAt)}</span>
              </div>
            </div>

            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_RECENT_ORDERS_TITLE_CONTAINER_L52.uuid} className="flex items-center gap-3 sm:gap-4">
              <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.RECENT_ORDERS.ORDER_VALUE.uuid} data-ui-instance-id={order.id} className="font-semibold text-sm">{formatCurrency(order.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentOrders;
