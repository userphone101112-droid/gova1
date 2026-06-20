import type { MerchantStatus, OrderStatus, StockStatus } from './types';

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return `${diffMins}m ago`;
}

export function getMerchantStatusColor(status: MerchantStatus): string {
  const colors: Record<MerchantStatus, string> = {
    active: 'text-success',
    away: 'text-warning',
    offline: 'text-muted-foreground',
  };
  return colors[status];
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: 'text-info',
    processing: 'text-warning',
    shipped: 'text-info',
    delivered: 'text-success',
    cancelled: 'text-error',
  };
  return colors[status];
}

export function getStockStatusColor(status: StockStatus): string {
  const colors: Record<StockStatus, string> = {
    in_stock: 'text-success',
    low_stock: 'text-warning',
    out_of_stock: 'text-error',
  };
  return colors[status];
}

export function getAchievementRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'border-outline-variant text-muted-foreground',
    rare: 'border-info text-info',
    epic: 'border-tertiary text-tertiary',
    legendary: 'border-warning text-warning',
  };
  return colors[rarity];
}

export function calculateRatingPercentage(ratingDistribution: { five: number; four: number; three: number; two: number; one: number }, stars: number): number {
  const total = Object.values(ratingDistribution).reduce((sum, val) => sum + val, 0);
  const count = 
    stars === 5 ? ratingDistribution.five :
    stars === 4 ? ratingDistribution.four :
    stars === 3 ? ratingDistribution.three :
    stars === 2 ? ratingDistribution.two :
    ratingDistribution.one;
  
  return total > 0 ? (count / total) * 100 : 0;
}
