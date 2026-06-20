'use client';

import {
  UiSection,
  UiDiv,
  UiH2,
  UiCard,
  UiBadge,
  UiLabel,
  MERCHANT,
  COMMON_LAYOUT,
  COMMON_TYPOGRAPHY,
  COMMON_COMPONENTS,
  useTranslation,
} from '@/platform/ui';
import type { QuickAction as QuickActionType } from '@/lib/merchant/types';
import { Plus, Package, ShoppingBag, MessageSquare, BarChart3, Megaphone, Warehouse } from 'lucide-react';

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
    <UiSection ui={MERCHANT.MERCHANT_PROFILE.QUICK_ACTIONS.CONTAINER} className={className}>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center justify-between mb-4">
        <UiH2 ui={MERCHANT.MERCHANT_PROFILE.QUICK_ACTIONS.TITLE} className="text-xl font-semibold tracking-tight">{t(MERCHANT.MERCHANT_PROFILE.QUICK_ACTIONS.TITLE)}</UiH2>
      </UiDiv>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {actions.map((action) => {
          const IconComponent = iconMap[action.icon] || Package;
          const isPrimary = action.variant === 'primary';

          return (
            <UiCard
              key={action.id}
              ui={COMMON_COMPONENTS.CARD.CONTAINER}
              className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg ${isPrimary ? 'border-primary/30 bg-primary/5' : ''}`}
            >
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-col items-center justify-center p-4">
                <UiDiv
                  ui={COMMON_LAYOUT.CONTAINER}
                  className={`relative mb-3 rounded-full p-2.5 transition-colors ${isPrimary ? 'bg-primary text-primary-foreground' : 'bg-muted group-hover:bg-primary/10'}`}
                >
                  <IconComponent
                    className={`h-5 w-5 ${isPrimary ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`}
                  />
                  {action.badge !== undefined && action.badge > 0 && (
                    <UiBadge
                      ui={COMMON_COMPONENTS.BADGE.LABEL}
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1.5 text-xs"
                    >
                      {action.badge > 99 ? '99+' : action.badge}
                    </UiBadge>
                  )}
                </UiDiv>
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm font-medium">{action.label}</UiLabel>
              </UiDiv>
            </UiCard>
          );
        })}
      </UiDiv>
    </UiSection>
  );
}

export default QuickActions;
