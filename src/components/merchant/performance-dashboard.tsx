'use client';

import {
  UiSection,
  UiDiv,
  UiH2,
  UiCard,
  UiLabel,
  UiP,
  UiSpan,
  MERCHANT,
  COMMON_LAYOUT,
  COMMON_TYPOGRAPHY,
  COMMON_COMPONENTS,
  useTranslation,
} from '@/platform/ui';
import type { PerformanceMetrics } from '@/lib/merchant/types';
import { formatCurrency } from '@/lib/merchant/utils';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingBag, Target, Package, Award, AlertTriangle } from 'lucide-react';

interface PerformanceDashboardProps {
  performance: PerformanceMetrics;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: any;
  iconVariant?: 'default' | 'success' | 'warning' | 'info';
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  iconVariant = 'default',
}: MetricCardProps) {
  const iconColors: Record<string, string> = {
    default: 'bg-muted',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100',
  };

  const iconTextColors: Record<string, string> = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  return (
    <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-4 sm:p-6">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start justify-between">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
            <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm font-medium text-muted-foreground">{title}</UiLabel>
            <UiP ui={COMMON_TYPOGRAPHY.P} className="text-2xl font-bold tracking-tight">{value}</UiP>
            {subtitle && <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-xs text-muted-foreground">{subtitle}</UiLabel>}
            {trend && trendValue && (
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                {trend === 'neutral' && <Minus className="h-3 w-3 text-muted-foreground" />}
                <UiSpan
                  ui={COMMON_LAYOUT.SPAN}
                  className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}
                >
                  {trendValue}
                </UiSpan>
              </UiDiv>
            )}
          </UiDiv>
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className={`rounded-full p-2.5 ${iconColors[iconVariant]}`}>
            <Icon className={`h-5 w-5 ${iconTextColors[iconVariant]}`} />
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiCard>
  );
}

export function PerformanceDashboard({ performance, className }: PerformanceDashboardProps) {
  const { t } = useTranslation();
  const inventoryHealthPercent =
    performance.inventoryHealth === 'healthy'
      ? 100
      : performance.inventoryHealth === 'low_stock'
      ? 60
      : 20;

  return (
    <UiSection ui={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONTAINER} className={className}>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center justify-between mb-4">
        <UiH2 ui={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.TITLE} className="text-xl font-semibold tracking-tight">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.TITLE)}</UiH2>
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY)}
          value={formatCurrency(performance.revenueToday)}
          subtitle={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY_SUBTITLE)}
          trend="up"
          trendValue="+12.5%"
          icon={DollarSign}
          iconVariant="success"
        />
        <MetricCard
          title={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH)}
          value={formatCurrency(performance.revenueThisMonth)}
          subtitle={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH_SUBTITLE)}
          trend="up"
          trendValue="+8.3% vs last month"
          icon={TrendingUp}
        />
        <MetricCard
          title={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY)}
          value={performance.ordersToday}
          subtitle={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY_SUBTITLE)}
          trend="up"
          trendValue="+5"
          icon={ShoppingBag}
        />
        <MetricCard
          title={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH)}
          value={performance.ordersThisMonth}
          subtitle={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH_SUBTITLE)}
          trend="up"
          trendValue="+15.2%"
          icon={Package}
        />
      </UiDiv>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Conversion Rate */}
        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="overflow-hidden">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-4 sm:p-6">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start justify-between">
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm font-medium text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE)}</UiLabel>
                <UiP ui={COMMON_TYPOGRAPHY.P} className="text-2xl font-bold tracking-tight">{performance.conversionRate}%</UiP>
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-xs text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE_SUBTITLE)}</UiLabel>
              </UiDiv>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-blue-100 p-2.5">
                <Target className="h-5 w-5 text-blue-600" />
              </UiDiv>
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <UiDiv
                ui={COMMON_LAYOUT.CONTAINER}
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${performance.conversionRate * 10}%` }}
              />
            </UiDiv>
          </UiDiv>
        </UiCard>

        {/* Average Order Value */}
        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="overflow-hidden">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-4 sm:p-6">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start justify-between">
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm font-medium text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE)}</UiLabel>
                <UiP ui={COMMON_TYPOGRAPHY.P} className="text-2xl font-bold tracking-tight">{formatCurrency(performance.averageOrderValue)}</UiP>
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-xs text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE_SUBTITLE)}</UiLabel>
              </UiDiv>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-yellow-100 p-2.5">
                <Award className="h-5 w-5 text-yellow-600" />
              </UiDiv>
            </UiDiv>
          </UiDiv>
        </UiCard>

        {/* Best Selling Category */}
        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="overflow-hidden">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-4 sm:p-6">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start justify-between">
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm font-medium text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY)}</UiLabel>
                <UiP ui={COMMON_TYPOGRAPHY.P} className="text-lg font-bold tracking-tight">{performance.bestSellingCategory}</UiP>
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-xs text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY_SUBTITLE)}</UiLabel>
              </UiDiv>
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-muted p-2.5">
                <Award className="h-5 w-5 text-muted-foreground" />
              </UiDiv>
            </UiDiv>
          </UiDiv>
        </UiCard>

        {/* Inventory Health */}
        <UiCard ui={COMMON_COMPONENTS.CARD.CONTAINER} className="overflow-hidden">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-4 sm:p-6">
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-start justify-between">
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm font-medium text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.INVENTORY_HEALTH)}</UiLabel>
                <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
                  <UiP ui={COMMON_TYPOGRAPHY.P} className="text-2xl font-bold tracking-tight capitalize">{performance.inventoryHealth.replace('_', ' ')}</UiP>
                  {performance.inventoryHealth !== 'healthy' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                </UiDiv>
              </UiDiv>
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <UiDiv
                ui={COMMON_LAYOUT.CONTAINER}
                className={`h-full transition-all ${performance.inventoryHealth === 'healthy' ? 'bg-green-600' : 'bg-yellow-500'}`}
                style={{ width: `${inventoryHealthPercent}%` }}
              />
            </UiDiv>
          </UiDiv>
        </UiCard>
      </UiDiv>
    </UiSection>
  );
}

export default PerformanceDashboard;
