import React from 'react';
import { Textarea, TextareaProps } from '@/components/ui/textarea';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';

export interface UiTextareaProps extends Omit<TextareaProps, 'data-ui'> {
  ui: UiParam;
}

const UiTextarea = React.forwardRef<HTMLTextAreaElement, UiTextareaProps>(
  ({ ui, ...props }, ref) => {
    const identity = resolveUiParam(ui);
    validateRuntimeIdentity('UiTextarea', ui, identity);

    return (
      <Textarea
        ref={ref}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        {...props}
      />
    );
  }
);
UiTextarea.displayName = 'UiTextarea';

export { UiTextarea };
