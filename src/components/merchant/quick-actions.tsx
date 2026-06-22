'use client';
import { Plus, Package, ShoppingBag, MessageSquare, BarChart3, Megaphone, Warehouse } from 'lucide-react';

import type { QuickAction as QuickActionType } from '@/lib/merchant/types';
import { MERCHANT, useTranslation } from '@/platform/ui';


const iconMap: Record<string, any> = {
  Plus,
  Package,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  Megaphone,
  Warehouse,
};

interface QuickActionsProps {
  actions: QuickActionType[];
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  const { t } = useTranslation();
  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.QUICK_ACTIONS.TITLE.uuid} className="text-xl font-semibold tracking-tight">{t(MERCHANT.MERCHANT_PROFILE.QUICK_ACTIONS.TITLE)}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {actions.map((action) => {
          const IconComponent = iconMap[action.icon] || Package;
          const isPrimary = action.variant === 'primary';

          return (
            <div data-ui-instance-id={action.id} key={action.id} className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg ${isPrimary ? 'border-primary/30 bg-primary/5' : ''}`}>
              <div className="flex flex-col items-center justify-center p-4">
                <div className={`relative mb-3 rounded-full p-2.5 transition-colors ${isPrimary ? 'bg-primary text-primary-foreground' : 'bg-muted group-hover:bg-primary/10'}`}>
                  <IconComponent
                    className={`h-5 w-5 ${isPrimary ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`}
                  />
                  {action.badge !== undefined && action.badge > 0 && (
                    <span data-ui-instance-id={action.id} className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1.5 text-xs">
                      {action.badge > 99 ? '99+' : action.badge}
                    </span>
                  )}
                </div>
                <span data-ui-instance-id={action.id} className="text-sm font-medium">{action.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default QuickActions;
