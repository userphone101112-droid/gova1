import React from 'react';
import { Header, HeaderProps } from '@/components/ui/header';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiHeaderProps extends Omit<HeaderProps, 'data-ui'> {
  ui: UiParam;
}

const UiHeader = React.forwardRef<HTMLHeadingElement, UiHeaderProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiHeader', ui, identity);

    return (
      <Header
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        data-ui-component="UiHeader"
        {...props}
      />
    );
  }
);
UiHeader.displayName = 'UiHeader';

export { UiHeader };
