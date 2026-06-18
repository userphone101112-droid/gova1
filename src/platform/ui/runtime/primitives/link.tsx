import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  asChild?: boolean;
}

const UiLinkBase = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, asChild = false, ...props }, ref) => {
    if (asChild) {
      return <a ref={ref} className={cn('transition-colors hover:text-primary', className)} {...props} />;
    }

    return (
      <Link
        href={href}
        className={cn('transition-colors hover:text-primary', className)}
        ref={ref as any}
        {...(props as any)}
      />
    );
  }
);
UiLinkBase.displayName = 'UiLinkBase';

export { UiLinkBase as Link };
