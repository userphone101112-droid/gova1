import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'muted' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Label = React.forwardRef<HTMLSpanElement, LabelProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-block',
          {
            'text-foreground': variant === 'default',
            'text-muted-foreground': variant === 'muted',
            'text-secondary-foreground': variant === 'secondary',
          },
          {
            'text-xs': size === 'sm',
            'text-sm': size === 'md',
            'text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

export { Label };
