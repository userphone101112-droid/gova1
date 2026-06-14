import React from 'react';
import { Radio, RadioProps } from '@/components/ui/radio';
import type { UiIdentifier } from '@/shared/ui-registry';

export interface UiRadioProps extends Omit<RadioProps, 'data-ui'> {
  ui: UiIdentifier;
}

const UiRadio = React.forwardRef<HTMLInputElement, UiRadioProps>(
  ({ ui, ...props }, ref) => {
    return <Radio ref={ref} data-ui={ui} {...props} />;
  }
);
UiRadio.displayName = 'UiRadio';

export { UiRadio };
