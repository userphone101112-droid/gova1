import React from 'react';
import { Link, LinkProps } from '@/components/ui/link';
import { type UiIdentifier, isRegisteredUiIdentifier } from '@/shared/ui-registry';

export interface UiLinkProps extends Omit<LinkProps, 'data-ui'> {
  ui: UiIdentifier;
}

const UiLink = React.forwardRef<HTMLAnchorElement, UiLinkProps>(
  ({ ui, ...props }, ref) => {
    if (process.env.NODE_ENV === 'development') {
      if (!isRegisteredUiIdentifier(ui)) {
        console.error(`[UI Registry] Unknown identifier: "${ui}"`);
      }
    }
    return <Link ref={ref} data-ui={ui} {...props} />;
  }
);
UiLink.displayName = 'UiLink';

export { UiLink };
