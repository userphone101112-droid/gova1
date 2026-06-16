import React from 'react';
import { Link, LinkProps } from '@/components/ui/link';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiLinkProps extends Omit<LinkProps, 'data-ui'> {
  ui: UiParam;
}

const UiLink = React.forwardRef<HTMLAnchorElement, UiLinkProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiLink', ui, identity);

    return (
      <Link
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        data-ui-component="UiLink"
        {...props}
      />
    );
  }
);
UiLink.displayName = 'UiLink';

export { UiLink };
