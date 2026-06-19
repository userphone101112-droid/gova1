import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md type-label-lg motion-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-disabled',
          {
            'bg-primary text-primary-foreground elevation-2 active:bg-primary/90 [@media(hover:hover)]:hover:bg-primary/90':
              variant === 'default',
            'bg-destructive text-destructive-foreground elevation-1 active:bg-destructive/90 [@media(hover:hover)]:hover:bg-destructive/90':
              variant === 'destructive',
            'border border-input bg-background elevation-1 active:bg-accent active:text-accent-foreground [@media(hover:hover)]:hover:bg-accent [@media(hover:hover)]:hover:text-accent-foreground':
              variant === 'outline',
            'bg-secondary text-secondary-foreground elevation-1 active:bg-secondary/80 [@media(hover:hover)]:hover:bg-secondary/80':
              variant === 'secondary',
            'active:bg-accent active:text-accent-foreground [@media(hover:hover)]:hover:bg-accent [@media(hover:hover)]:hover:text-accent-foreground': variant === 'ghost',
            'text-primary underline-offset-4 active:underline [@media(hover:hover)]:hover:underline': variant === 'link',
          },
          {
            'h-9 px-4 py-2': size === 'default',
            'h-8 rounded-md px-3 type-label-sm': size === 'sm',
            'h-10 rounded-md px-8 type-body-md': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
