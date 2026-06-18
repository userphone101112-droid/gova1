import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'border-transparent bg-primary text-primary-foreground shadow': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'border-transparent bg-destructive text-destructive-foreground shadow': variant === 'destructive',
          'text-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge };
