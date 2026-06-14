import React from 'react';
import { Link, LinkProps } from '@/components/ui/link';
import type { UiIdentifier } from '@/shared/ui-registry';

export interface UiLinkProps extends Omit<LinkProps, 'data-ui'> {
  ui: UiIdentifier;
}

const UiLink = React.forwardRef<HTMLAnchorElement, UiLinkProps>(
  ({ ui, ...props }, ref) => {
    return <Link ref={ref} data-ui={ui} {...props} />;
  }
);
UiLink.displayName = 'UiLink';

export { UiLink };
