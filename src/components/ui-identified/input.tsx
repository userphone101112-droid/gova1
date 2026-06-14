import React from 'react';
import { Input, InputProps } from '@/components/ui/input';
import type { UiIdentifier } from '@/shared/ui-registry';

export interface UiInputProps extends Omit<InputProps, 'data-ui'> {
  ui: UiIdentifier;
}

const UiInput = React.forwardRef<HTMLInputElement, UiInputProps>(
  ({ ui, ...props }, ref) => {
    return <Input ref={ref} data-ui={ui} {...props} />;
  }
);
UiInput.displayName = 'UiInput';

export { UiInput };
