import React from 'react';
import { Checkbox, CheckboxProps } from '@/components/ui/checkbox';
import type { UiIdentifier } from '@/shared/ui-registry';

export interface UiCheckboxProps extends Omit<CheckboxProps, 'data-ui'> {
  ui: UiIdentifier;
}

const UiCheckbox = React.forwardRef<HTMLInputElement, UiCheckboxProps>(
  ({ ui, ...props }, ref) => {
    return <Checkbox ref={ref} data-ui={ui} {...props} />;
  }
);
UiCheckbox.displayName = 'UiCheckbox';

export { UiCheckbox };
