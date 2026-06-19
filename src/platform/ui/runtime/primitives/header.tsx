import React from 'react';
import { cn } from '@/lib/utils';

export interface HeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const LEVEL_TYPE_CLASS: Record<number, string> = {
  1: 'type-display-md',
  2: 'type-headline-lg',
  3: 'type-headline-md',
  4: 'type-headline-sm',
  5: 'type-title-lg',
  6: 'type-title-md',
};

const Header = React.forwardRef<HTMLHeadingElement, HeaderProps>(
  ({ className, level = 1, ...props }, ref) => {
    const Tag = `h${level}` as const;

    return (
      <Tag
        ref={ref}
        className={cn('text-foreground', LEVEL_TYPE_CLASS[level], className)}
        {...props}
      />
    );
  }
);
Header.displayName = 'Header';

export { Header };
