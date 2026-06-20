/**
 * UI Component Factory
 * 
 * This factory creates type-safe UI-identified components for any HTML element.
 * All components automatically include UI registry validation and data attributes.
 */

import React from 'react';

import { UI_REGISTRY_CONFIG } from '@/platform/ui/registry/config';
import { getUiIdentityUuid, type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/platform/ui/registry/registry';

export interface UiComponentProps extends React.HTMLAttributes<HTMLElement> {
  ui: UiParam;
  uiInstanceId?: string | number;
  children?: React.ReactNode;
}

/**
 * Creates a UI-identified component for any HTML element
 * @param tagName - The HTML element tag name (e.g., 'div', 'span', 'button')
 * @param componentName - The component name for validation messages
 * @returns A React forwardRef component with UI identification
 */
export function createUiComponent(
  tagName: string,
  componentName: string
) {
  const Component = React.forwardRef<HTMLElement, UiComponentProps>(
    ({ ui, uiInstanceId, children, className = '', ...props }, ref) => {
      const identity = resolveUiParam(ui);
      const uuid = identity ? getUiIdentityUuid(identity) : undefined;
      const instanceId = uiInstanceId === undefined ? undefined : String(uiInstanceId);
      
      // Only validate in development mode
      if (UI_REGISTRY_CONFIG.enableValidation) {
        validateRuntimeIdentity(componentName, ui, identity);
      }

      return React.createElement(
        tagName,
        {
          ref,
          'data-ui-uuid': uuid,
          'data-ui-instance-id': instanceId,
          'data-ui-identity-key': uuid && instanceId ? `${uuid}:${instanceId}` : uuid,
          'data-ui-id': identity?.id,
          'data-ui-path': identity?.path,
          'data-ui-feature': identity?.feature,
          'data-ui-component': componentName,
          className,
          ...props
        },
        children
      );
    }
  );

  Component.displayName = componentName;
  return Component;
}
