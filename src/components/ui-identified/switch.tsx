import React from 'react';
import { Switch, SwitchProps } from '@/components/ui/switch';
import type { UiIdentifier } from '@/shared/ui-registry';

export interface UiSwitchProps extends Omit<SwitchProps, 'data-ui'> {
  ui: UiIdentifier;
}

const UiSwitch = React.forwardRef<HTMLInputElement, UiSwitchProps>(
  ({ ui, ...props }, ref) => {
    return <Switch ref={ref} data-ui={ui} {...props} />;
  }
);
UiSwitch.displayName = 'UiSwitch';

export { UiSwitch };
