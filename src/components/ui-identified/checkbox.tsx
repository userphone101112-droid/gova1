import React from 'react';
import { Checkbox, CheckboxProps } from '@/components/ui/checkbox';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiCheckboxProps extends Omit<CheckboxProps, 'data-ui'> {
  ui: UiParam;
}

const UiCheckbox = React.forwardRef<HTMLInputElement, UiCheckboxProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiCheckbox', ui, identity);

    return (
      <Checkbox
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        {...props}
      />
    );
  }
);
UiCheckbox.displayName = 'UiCheckbox';

export { UiCheckbox };
