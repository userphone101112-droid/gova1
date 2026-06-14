import React from 'react';
import { Textarea, TextareaProps } from '@/components/ui/textarea';
import type { UiIdentifier } from '@/shared/ui-registry';

export interface UiTextareaProps extends Omit<TextareaProps, 'data-ui'> {
  ui: UiIdentifier;
}

const UiTextarea = React.forwardRef<HTMLTextAreaElement, UiTextareaProps>(
  ({ ui, ...props }, ref) => {
    return <Textarea ref={ref} data-ui={ui} {...props} />;
  }
);
UiTextarea.displayName = 'UiTextarea';

export { UiTextarea };
