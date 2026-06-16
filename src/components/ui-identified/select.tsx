import React from 'react';
import { Select, SelectProps } from '@/components/ui/select';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiSelectProps extends Omit<SelectProps, 'data-ui'> {
  ui: UiParam;
}

const UiSelect = React.forwardRef<HTMLSelectElement, UiSelectProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiSelect', ui, identity);

    return (
      <Select
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        data-ui-component="UiSelect"
        {...props}
      />
    );
  }
);
UiSelect.displayName = 'UiSelect';

export { UiSelect };
