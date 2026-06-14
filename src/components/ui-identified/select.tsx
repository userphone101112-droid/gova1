import React from 'react';
import { Select, SelectProps } from '@/components/ui/select';
import type { UiIdentifier } from '@/shared/ui-registry';

export interface UiSelectProps extends Omit<SelectProps, 'data-ui'> {
  ui: UiIdentifier;
}

const UiSelect = React.forwardRef<HTMLSelectElement, UiSelectProps>(
  ({ ui, ...props }, ref) => {
    return <Select ref={ref} data-ui={ui} {...props} />;
  }
);
UiSelect.displayName = 'UiSelect';

export { UiSelect };
