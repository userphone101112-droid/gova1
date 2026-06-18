import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        variant === 'outline' && 'bg-transparent',
        variant === 'ghost' && 'border-transparent shadow-none',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export { Card };
