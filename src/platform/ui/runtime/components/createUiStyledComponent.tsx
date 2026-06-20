import React from 'react';

import { UI_REGISTRY_CONFIG } from '@/platform/ui/registry/config';
import { getUiIdentityUuid, type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/platform/ui/registry/registry';

export type UiStyledProps<P> = P & {
  ui: UiParam;
  uiInstanceId?: string | number;
};

/**
 * Wraps a styled primitive with UI registry identity attributes.
 */
export function createUiStyledComponent<P extends object, R = HTMLElement>(
  StyledComponent: React.ForwardRefExoticComponent<P & React.RefAttributes<R>>,
  componentName: string
) {
  const Component = React.forwardRef<R, UiStyledProps<P>>((props, ref) => {
    const { ui, uiInstanceId, ...rest } = props;
    const identity = resolveUiParam(ui);
    const uuid = identity ? getUiIdentityUuid(identity) : undefined;
    const instanceId = uiInstanceId === undefined ? undefined : String(uiInstanceId);

    if (UI_REGISTRY_CONFIG.enableValidation) {
      validateRuntimeIdentity(componentName, ui, identity);
    }

    return (
      <StyledComponent
        ref={ref}
        {...(rest as P)}
        data-ui-uuid={uuid}
        data-ui-instance-id={instanceId}
        data-ui-identity-key={uuid && instanceId ? `${uuid}:${instanceId}` : uuid}
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
