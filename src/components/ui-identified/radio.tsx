import React from 'react';
import { Radio, RadioProps } from '@/components/ui/radio';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiRadioProps extends Omit<RadioProps, 'data-ui'> {
  ui: UiParam;
}

const UiRadio = React.forwardRef<HTMLInputElement, UiRadioProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiRadio', ui, identity);

    return (
      <Radio
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        {...props}
      />
    );
  }
);
UiRadio.displayName = 'UiRadio';

export { UiRadio };
