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
        <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY.uuid} data-ui-instance-id={instanceId} className="text-sm font-medium text-muted-foreground">{title}</span>
        <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY_VALUE.uuid} data-ui-instance-id={instanceId} className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY_SUBTITLE.uuid} data-ui-instance-id={instanceId} className="text-xs text-muted-foreground">{subtitle}</span>}
      </>
    );
  }
  if (variant === 'revenue-month') {
    return (
      <>
        <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH.uuid} data-ui-instance-id={instanceId} className="text-sm font-medium text-muted-foreground">{title}</span>
        <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH_VALUE.uuid} data-ui-instance-id={instanceId} className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH_SUBTITLE.uuid} data-ui-instance-id={instanceId} className="text-xs text-muted-foreground">{subtitle}</span>}
      </>
    );
  }
  if (variant === 'orders-today') {
    return (
      <>
        <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY.uuid} data-ui-instance-id={instanceId} className="text-sm font-medium text-muted-foreground">{title}</span>
        <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY_VALUE.uuid} data-ui-instance-id={instanceId} className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY_SUBTITLE.uuid} data-ui-instance-id={instanceId} className="text-xs text-muted-foreground">{subtitle}</span>}
      </>
    );
  }
  return (
    <>
      <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH.uuid} data-ui-instance-id={instanceId} className="text-sm font-medium text-muted-foreground">{title}</span>
      <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH_VALUE.uuid} data-ui-instance-id={instanceId} className="text-2xl font-bold tracking-tight">{value}</p>
      {subtitle && <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH_SUBTITLE.uuid} data-ui-instance-id={instanceId} className="text-xs text-muted-foreground">{subtitle}</span>}
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
    <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.METRIC_CARD.uuid} data-ui-instance-id={instanceId} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div data-ui-uuid={MERCHANT.SHELL.PERFORMANCE_DASHBOARD_L50.uuid} className="p-4 sm:p-6">
        <div data-ui-uuid={MERCHANT.SHELL.PERFORMANCE_DASHBOARD_L51.uuid} className="flex items-start justify-between">
          <div data-ui-uuid={MERCHANT.SHELL.PERFORMANCE_DASHBOARD_L52.uuid} className="space-y-2">
            <MetricCardContent
              variant={variant}
              instanceId={instanceId}
              title={title}
              value={value}
              {...(subtitle !== undefined ? { subtitle } : {})}
            />
            {trend && trendValue && (
              <div data-ui-uuid={MERCHANT.SHELL.PERFORMANCE_DASHBOARD_L57.uuid} className="flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-error" />}
                {trend === 'neutral' && <Minus className="h-3 w-3 text-muted-foreground" />}
                <span data-ui-uuid={MERCHANT.SHELL.PERFORMANCE_DASHBOARD_L61.uuid} className={`text-xs font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div data-ui-uuid={MERCHANT.SHELL.PERFORMANCE_DASHBOARD_L67.uuid} className={`rounded-full p-2.5 ${iconColors[iconVariant]}`}>
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
    <section data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONTAINER.uuid} className={className}>
      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_TITLE_CONTAINER_L87.uuid} className="flex items-center justify-between mb-4">
        <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.TITLE.uuid} className="text-xl font-semibold tracking-tight">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.TITLE)}</h2>
      </div>

      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_TITLE_CONTAINER_L91.uuid} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          variant="revenue-today"
          instanceId="revenue-today"
          title={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY)}
          value={formatCurrency(performance.revenueToday)}
          subtitle={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_TODAY_SUBTITLE)}
          trend="up"
          trendValue="+12.5%"
          icon={DollarSign}
          iconVariant="success"
        />
        <MetricCard
          variant="revenue-month"
          instanceId="revenue-month"
          title={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH)}
          value={formatCurrency(performance.revenueThisMonth)}
          subtitle={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.REVENUE_MONTH_SUBTITLE)}
          trend="up"
          trendValue="+8.3% vs last month"
          icon={TrendingUp}
        />
        <MetricCard
          variant="orders-today"
          instanceId="orders-today"
          title={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY)}
          value={performance.ordersToday}
          subtitle={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_TODAY_SUBTITLE)}
          trend="up"
          trendValue="+5"
          icon={ShoppingBag}
        />
        <MetricCard
          variant="orders-month"
          instanceId="orders-month"
          title={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH)}
          value={performance.ordersThisMonth}
          subtitle={t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.ORDERS_MONTH_SUBTITLE)}
          trend="up"
          trendValue="+15.2%"
          icon={Package}
        />
      </div>

      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_CONVERSION_RATE_CONTAINER_L127.uuid} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Conversion Rate */}
        <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_CARD.uuid} className="overflow-hidden">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_CONVERSION_RATE_CONTAINER_L130.uuid} className="p-4 sm:p-6">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_CONVERSION_RATE_CONTAINER_L131.uuid} className="flex items-start justify-between">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_CONVERSION_RATE_CONTAINER_L132.uuid} className="space-y-2">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE.uuid} data-ui-instance-id="conversion-rate" className="text-sm font-medium text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE)}</span>
                <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE_VALUE.uuid} data-ui-instance-id="conversion-rate" className="text-2xl font-bold tracking-tight">{performance.conversionRate}%</p>
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE_SUBTITLE.uuid} data-ui-instance-id="conversion-rate" className="text-xs text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CONVERSION_RATE_SUBTITLE)}</span>
              </div>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_CONVERSION_RATE_CONTAINER_L137.uuid} className="rounded-full bg-info-container p-2.5">
                <Target className="h-5 w-5 text-info" />
              </div>
            </div>
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_CONVERSION_RATE_CONTAINER_L141.uuid} className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_CONVERSION_RATE_CONTAINER_L142.uuid} className="h-full bg-info transition-all" style={{ width: `${performance.conversionRate * 10}%` }} />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AOV_CARD.uuid} className="overflow-hidden">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_AVG_ORDER_VALUE_CONTAINER_L149.uuid} className="p-4 sm:p-6">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_AVG_ORDER_VALUE_CONTAINER_L150.uuid} className="flex items-start justify-between">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_AVG_ORDER_VALUE_CONTAINER_L151.uuid} className="space-y-2">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE.uuid} data-ui-instance-id="avg-order-value" className="text-sm font-medium text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE)}</span>
                <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE_VALUE.uuid} data-ui-instance-id="avg-order-value" className="text-2xl font-bold tracking-tight">{formatCurrency(performance.averageOrderValue)}</p>
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE_SUBTITLE.uuid} data-ui-instance-id="avg-order-value" className="text-xs text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.AVG_ORDER_VALUE_SUBTITLE)}</span>
              </div>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_AVG_ORDER_VALUE_CONTAINER_L156.uuid} className="rounded-full bg-warning-container p-2.5">
                <Award className="h-5 w-5 text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* Best Selling Category */}
        <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.CATEGORY_CARD.uuid} className="overflow-hidden">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_BEST_SELLING_CATEGORY_CONTAINER_L165.uuid} className="p-4 sm:p-6">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_BEST_SELLING_CATEGORY_CONTAINER_L166.uuid} className="flex items-start justify-between">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_BEST_SELLING_CATEGORY_CONTAINER_L167.uuid} className="space-y-2">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY.uuid} data-ui-instance-id="best-selling-category" className="text-sm font-medium text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY)}</span>
                <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY_VALUE.uuid} data-ui-instance-id="best-selling-category" className="text-lg font-bold tracking-tight">{performance.bestSellingCategory}</p>
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY_SUBTITLE.uuid} data-ui-instance-id="best-selling-category" className="text-xs text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.BEST_SELLING_CATEGORY_SUBTITLE)}</span>
              </div>
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_BEST_SELLING_CATEGORY_CONTAINER_L172.uuid} className="rounded-full bg-muted p-2.5">
                <Award className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Health */}
        <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.INVENTORY_CARD.uuid} className="overflow-hidden">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_INVENTORY_HEALTH_CONTAINER_L181.uuid} className="p-4 sm:p-6">
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_INVENTORY_HEALTH_CONTAINER_L182.uuid} className="flex items-start justify-between">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_INVENTORY_HEALTH_CONTAINER_L183.uuid} className="space-y-2">
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.INVENTORY_HEALTH.uuid} data-ui-instance-id="inventory-health" className="text-sm font-medium text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.PERFORMANCE.INVENTORY_HEALTH)}</span>
                <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_INVENTORY_HEALTH_CONTAINER_L185.uuid} className="flex items-center gap-2">
                  <p data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PERFORMANCE.INVENTORY_HEALTH_VALUE.uuid} data-ui-instance-id="inventory-health" className="text-2xl font-bold tracking-tight capitalize">{performance.inventoryHealth.replace('_', ' ')}</p>
                  {performance.inventoryHealth !== 'healthy' && <AlertTriangle className="h-5 w-5 text-warning" />}
                </div>
              </div>
            </div>
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_INVENTORY_HEALTH_CONTAINER_L191.uuid} className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden">
              <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PERFORMANCE_INVENTORY_HEALTH_CONTAINER_L192.uuid} className={`h-full transition-all ${performance.inventoryHealth === 'healthy' ? 'bg-success' : 'bg-warning'}`} style={{ width: `${inventoryHealthPercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PerformanceDashboard;
