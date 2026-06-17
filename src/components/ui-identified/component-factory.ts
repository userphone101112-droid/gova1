/**
 * UI Component Factory
 * 
 * This factory creates type-safe UI-identified components for any HTML element.
 * All components automatically include UI registry validation and data attributes.
 */

import React from 'react';
import { type UiParam, resolveUiParam, validateRuntimeIdentity } from '@/shared/ui-registry';
import { UI_REGISTRY_CONFIG } from '@/shared/ui-registry/config';

export interface UiComponentProps extends React.HTMLAttributes<HTMLElement> {
  ui: UiParam;
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
    ({ ui, children, className = '', ...props }, ref) => {
      const identity = resolveUiParam(ui);
      
      // Only validate in development mode
      if (UI_REGISTRY_CONFIG.enableValidation) {
        validateRuntimeIdentity(componentName, ui, identity);
      }

      return React.createElement(
        tagName,
        {
          ref,
          'data-ui-id': identity?.id,
          'data-ui-path': identity?.path,
          'data-ui-feature': identity?.feature,
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
