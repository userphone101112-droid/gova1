import React from 'react';
import { Label, LabelProps } from '@/components/ui/label';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiLabelProps extends Omit<LabelProps, 'data-ui'> {
  ui: UiParam;
}

const UiLabel = React.forwardRef<HTMLSpanElement, UiLabelProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiLabel', ui, identity);

    return (
      <Label
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        {...props}
      />
    );
  }
);
UiLabel.displayName = 'UiLabel';

export { UiLabel };
