'use client';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingBag, Target, Package, Award, AlertTriangle } from 'lucide-react';

import type { PerformanceMetrics } from '@/lib/merchant/types';
import { formatCurrency } from '@/lib/merchant/utils';
import { MERCHANT, useTranslation } from '@/platform/ui';



interface PerformanceDashboardProps {
  performance: PerformanceMetrics;
  className?: string;
}

interface MetricCardProps {
  variant: 'revenue-today' | 'revenue-month' | 'orders-today' | 'orders-month';
  instanceId: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: any;
  iconVariant?: 'default' | 'success' | 'warning' | 'info';
}

function MetricCardContent({
  variant,
  instanceId,
  title,
  value,
  subtitle,
}: Pick<MetricCardProps, 'variant' | 'instanceId' | 'title' | 'value' | 'subtitle'>) {
  if (variant === 'revenue-today') {
    return (
      <>
        <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY.uuid}`} data-ui-instance-id={instanceId} className="text-sm font-medium text-muted-foreground">{title}</span>
        <p data-ui-instance-id={instanceId} className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY_SUBTITLE.uuid}`} data-ui-instance-id={instanceId} className="text-xs text-muted-foreground">{subtitle}</span>}
      </>
    );
  }
  if (variant === 'revenue-month') {
    return (
      <>
        <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH.uuid}`} data-ui-instance-id={instanceId} className="text-sm font-medium text-muted-foreground">{title}</span>
        <p data-ui-instance-id={instanceId} className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH_SUBTITLE.uuid}`} data-ui-instance-id={instanceId} className="text-xs text-muted-foreground">{subtitle}</span>}
      </>
    );
  }
  if (variant === 'orders-today') {
    return (
      <>
        <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY.uuid}`} data-ui-instance-id={instanceId} className="text-sm font-medium text-muted-foreground">{title}</span>
        <p data-ui-instance-id={instanceId} className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY_SUBTITLE.uuid}`} data-ui-instance-id={instanceId} className="text-xs text-muted-foreground">{subtitle}</span>}
      </>
    );
  }
  return (
    <>
      <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH.uuid}`} data-ui-instance-id={instanceId} className="text-sm font-medium text-muted-foreground">{title}</span>
      <p data-ui-instance-id={instanceId} className="text-2xl font-bold tracking-tight">{value}</p>
      {subtitle && <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH_SUBTITLE.uuid}`} data-ui-instance-id={instanceId} className="text-xs text-muted-foreground">{subtitle}</span>}
    </>
  );
}

function MetricCard({
  variant,
  instanceId,
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
    success: 'bg-success-container',
    warning: 'bg-warning-container',
    info: 'bg-info-container',
  };

  const iconTextColors: Record<string, string> = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
  };

  return (
    <div data-ui-instance-id={instanceId} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <MetricCardContent
              variant={variant}
              instanceId={instanceId}
              title={title}
              value={value}
              {...(subtitle !== undefined ? { subtitle } : {})}
            />
            {trend && trendValue && (
              <div className="flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-error" />}
                {trend === 'neutral' && <Minus className="h-3 w-3 text-muted-foreground" />}
                <span className={`text-xs font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`rounded-full p-2.5 ${iconColors[iconVariant]}`}>
            <Icon className={`h-5 w-5 ${iconTextColors[iconVariant]}`} />
          </div>
        </div>
      </div>
    </div>
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
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.TITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.TITLE.uuid}`} className="text-xl font-semibold tracking-tight">{t('merchant.performance.title')}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          variant="revenue-today"
          instanceId="revenue-today"
          title={t('merchant.performance.revenueToday')}
          value={formatCurrency(performance.revenueToday)}
          subtitle={t('merchant.performance.revenueTodaySubtitle')}
          trend="up"
          trendValue="+12.5%"
          icon={DollarSign}
          iconVariant="success"
        />
        <MetricCard
          variant="revenue-month"
          instanceId="revenue-month"
          title={t('merchant.performance.revenueMonth')}
          value={formatCurrency(performance.revenueThisMonth)}
          subtitle={t('merchant.performance.revenueMonthSubtitle')}
          trend="up"
          trendValue="+8.3% vs last month"
          icon={TrendingUp}
        />
        <MetricCard
          variant="orders-today"
          instanceId="orders-today"
          title={t('merchant.performance.ordersToday')}
          value={performance.ordersToday}
          subtitle={t('merchant.performance.ordersTodaySubtitle')}
          trend="up"
          trendValue="+5"
          icon={ShoppingBag}
        />
        <MetricCard
          variant="orders-month"
          instanceId="orders-month"
          title={t('merchant.performance.ordersMonth')}
          value={performance.ordersThisMonth}
          subtitle={t('merchant.performance.ordersMonthSubtitle')}
          trend="up"
          trendValue="+15.2%"
          icon={Package}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Conversion Rate */}
        <div className="overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE.uuid}`} data-ui-instance-id="conversion-rate" className="text-sm font-medium text-muted-foreground">{t('merchant.performance.conversionRate')}</span>
                <p data-ui-instance-id="conversion-rate" className="text-2xl font-bold tracking-tight">{performance.conversionRate}%</p>
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE_SUBTITLE.uuid}`} data-ui-instance-id="conversion-rate" className="text-xs text-muted-foreground">{t('merchant.performance.conversionRateSubtitle')}</span>
              </div>
              <div className="rounded-full bg-info-container p-2.5">
                <Target className="h-5 w-5 text-info" />
              </div>
            </div>
            <div className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-info transition-all" style={{ width: `${performance.conversionRate * 10}%` }} />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE.uuid}`} data-ui-instance-id="avg-order-value" className="text-sm font-medium text-muted-foreground">{t('merchant.performance.avgOrderValue')}</span>
                <p data-ui-instance-id="avg-order-value" className="text-2xl font-bold tracking-tight">{formatCurrency(performance.averageOrderValue)}</p>
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE_SUBTITLE.uuid}`} data-ui-instance-id="avg-order-value" className="text-xs text-muted-foreground">{t('merchant.performance.avgOrderValueSubtitle')}</span>
              </div>
              <div className="rounded-full bg-warning-container p-2.5">
                <Award className="h-5 w-5 text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* Best Selling Category */}
        <div className="overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY.uuid}`} data-ui-instance-id="best-selling-category" className="text-sm font-medium text-muted-foreground">{t('merchant.performance.bestSellingCategory')}</span>
                <p data-ui-instance-id="best-selling-category" className="text-lg font-bold tracking-tight">{performance.bestSellingCategory}</p>
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY_SUBTITLE.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY_SUBTITLE.uuid}`} data-ui-instance-id="best-selling-category" className="text-xs text-muted-foreground">{t('merchant.performance.bestSellingCategorySubtitle')}</span>
              </div>
              <div className="rounded-full bg-muted p-2.5">
                <Award className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.INVENTORY_HEALTH.uuid}
          data-ui-lang-uuid={`lang-${MERCHANT.MERCHANT_PROFILE.PERFORMANCE.INVENTORY_HEALTH.uuid}`} data-ui-instance-id="inventory-health" className="text-sm font-medium text-muted-foreground">{t('merchant.performance.inventoryHealth')}</span>
                <div className="flex items-center gap-2">
                  <p data-ui-instance-id="inventory-health" className="text-2xl font-bold tracking-tight capitalize">{performance.inventoryHealth.replace('_', ' ')}</p>
                  {performance.inventoryHealth !== 'healthy' && <AlertTriangle className="h-5 w-5 text-warning" />}
                </div>
              </div>
            </div>
            <div className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden">
              <div className={`h-full transition-all ${performance.inventoryHealth === 'healthy' ? 'bg-success' : 'bg-warning'}`} style={{ width: `${inventoryHealthPercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PerformanceDashboard;
