import React from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiInputProps extends Omit<InputProps, 'data-ui'> {
  ui: UiParam;
}

const UiInput = React.forwardRef<HTMLInputElement, UiInputProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiInput', ui, identity);

    return (
      <Input
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        data-ui-component="UiInput"
        {...props}
      />
    );
  }
);
UiInput.displayName = 'UiInput';

export { UiInput };
