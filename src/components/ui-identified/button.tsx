import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiButtonProps extends Omit<ButtonProps, 'data-ui'> {
  ui: UiParam;
}

const UiButton = React.forwardRef<HTMLButtonElement, UiButtonProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiButton', ui, identity);

    return (
      <Button
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        data-ui-component="UiButton"
        {...props}
      />
    );
  }
);
UiButton.displayName = 'UiButton';

export { UiButton };
