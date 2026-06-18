import React from 'react';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/platform/ui/registry/registry';
import { UI_REGISTRY_CONFIG } from '@/platform/ui/registry/config';

export type UiStyledProps<P> = P & { ui: UiParam };

/**
 * Wraps a styled primitive with UI registry identity attributes.
 */
export function createUiStyledComponent<P extends object, R = HTMLElement>(
  StyledComponent: React.ForwardRefExoticComponent<P & React.RefAttributes<R>>,
  componentName: string
) {
  const Component = React.forwardRef<R, UiStyledProps<P>>((props, ref) => {
    const { ui, ...rest } = props;
    const identity = resolveUiParam(ui);

    if (UI_REGISTRY_CONFIG.enableValidation) {
      validateRuntimeIdentity(componentName, ui, identity);
    }

    return (
      <StyledComponent
        ref={ref}
        {...(rest as P)}
        data-ui-id={identity?.id}
        data-ui-path={identity?.path}
        data-ui-feature={identity?.feature}
        data-ui-component={componentName}
      />
    );
  });

  Component.displayName = componentName;
  return Component;
}
