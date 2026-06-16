import React from 'react';
import { Switch, SwitchProps } from '@/components/ui/switch';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiSwitchProps extends Omit<SwitchProps, 'data-ui'> {
  ui: UiParam;
}

const UiSwitch = React.forwardRef<HTMLInputElement, UiSwitchProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiSwitch', ui, identity);

    return (
      <Switch
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        data-ui-component="UiSwitch"
        {...props}
      />
    );
  }
);
UiSwitch.displayName = 'UiSwitch';

export { UiSwitch };
