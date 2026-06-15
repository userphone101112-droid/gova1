import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { type UiIdentifier, isRegisteredUiIdentifier } from '@/shared/ui-registry';

export interface UiButtonProps extends Omit<ButtonProps, 'data-ui'> {
  ui: UiIdentifier;
}

const UiButton = React.forwardRef<HTMLButtonElement, UiButtonProps>(
  ({ ui, ...props }, ref) => {
    if (process.env.NODE_ENV === 'development') {
      if (!isRegisteredUiIdentifier(ui)) {
        console.error(`[UI Registry] Unknown identifier: "${ui}"`);
      }
    }
    return <Button ref={ref} data-ui={ui} {...props} />;
  }
);
UiButton.displayName = 'UiButton';

export { UiButton };
