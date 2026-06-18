import React from 'react';
import { cn } from '@/lib/utils';

export interface HeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

const Header = React.forwardRef<HTMLHeadingElement, HeaderProps>(
  ({ className, level = 1, ...props }, ref) => {
    const Tag = `h${level}` as const;

    return (
      <Tag
        ref={ref}
        className={cn(
          'font-bold text-foreground',
          {
            'text-4xl': level === 1,
            'text-3xl': level === 2,
            'text-2xl': level === 3,
            'text-xl': level === 4,
            'text-lg': level === 5,
            'text-base': level === 6,
          },
          className
        )}
        {...props}
      />
    );
  }
);
Header.displayName = 'Header';

export { Header };
