/**
 * UI Identity Generator - Professional Helper Functions
 * 
 * Generates UI Identities automatically based on hierarchy and context.
 * Provides 100% deterministic results with scalability and extensibility.
 */

import type { UiIdentity } from './types';

export interface UiIdentityContext {
  feature: string;
  section?: string;
  component?: string;
  element?: string;
  variant?: string;
  index?: number;
}

/**
 * Generates a stable UI ID based on hierarchy and context
 * @param context - The UI identity context
 * @returns A stable UI ID string
 */
export function generateUiId(context: UiIdentityContext): string {
  const parts = [
    context.feature.toUpperCase(),
    context.section?.toUpperCase(),
    context.component?.toUpperCase(),
    context.element?.toUpperCase(),
    context.variant?.toUpperCase(),
    context.index !== undefined ? String(context.index) : undefined,
  ].filter(Boolean);

  return parts.join('_');
}

/**
 * Generates a UI path based on hierarchy and context
 * @param context - The UI identity context
 * @returns A UI path string (kebab-case)
 */
export function generateUiPath(context: UiIdentityContext): string {
  const parts = [
    context.feature,
    context.section,
    context.component,
    context.element,
    context.variant,
    context.index !== undefined ? String(context.index) : undefined,
  ].filter(Boolean);

  return parts.join('.');
}

/**
 * Generates a complete UiIdentity object
 * @param context - The UI identity context
 * @param description - Description of the UI element
 * @param category - Category of the UI element
 * @returns A complete UiIdentity object
 */
export function generateUiIdentity(
  context: UiIdentityContext,
  description: string,
  category: 'action' | 'input' | 'navigation' | 'display' | 'container'
): UiIdentity {
  const now = new Date().toISOString();

  return {
    id: generateUiId(context),
    path: generateUiPath(context),
    description,
    category,
    feature: context.feature,
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generates UI Identities for a component with multiple elements
 * @param baseContext - Base context for the component
 * @param elements - Array of element definitions
 * @returns Array of UiIdentity objects
 */
export function generateComponentIdentities(
  baseContext: UiIdentityContext,
  elements: Array<{
    element: string;
    description: string;
    category: 'action' | 'input' | 'navigation' | 'display' | 'container';
    variant?: string;
  }>
): UiIdentity[] {
  return elements.map((el) => {
    const context: UiIdentityContext = {
      ...baseContext,
      element: el.element,
    };
    if (el.variant) {
      context.variant = el.variant;
    }
    return generateUiIdentity(context, el.description, el.category);
  });
}

/**
 * Generates UI Identities for dynamic elements (e.g., list items)
 * @param baseContext - Base context for the dynamic elements
 * @param count - Number of dynamic elements
 * @param elementName - Name of the element
 * @param description - Description template (use {index} for index)
 * @param category - Category of the UI element
 * @returns Array of UiIdentity objects
 */
export function generateDynamicIdentities(
  baseContext: UiIdentityContext,
  count: number,
  elementName: string,
  description: string,
  category: 'action' | 'input' | 'navigation' | 'display' | 'container'
): UiIdentity[] {
  const identities: UiIdentity[] = [];

  for (let i = 0; i < count; i++) {
    identities.push(
      generateUiIdentity(
        { ...baseContext, element: elementName, index: i },
        description.replace('{index}', String(i)),
        category
      )
    );
  }

  return identities;
}

/**
 * Validates a UI Identity context
 * @param context - The UI identity context to validate
 * @returns true if valid, false otherwise
 */
export function validateUiIdentityContext(context: UiIdentityContext): boolean {
  if (!context.feature || context.feature.trim() === '') {
    return false;
  }

  if (!/^[a-z][a-z0-9-]*$/.test(context.feature)) {
    return false;
  }

  if (context.section && !/^[a-z][a-z0-9-]*$/.test(context.section)) {
    return false;
  }

  if (context.component && !/^[a-z][a-z0-9-]*$/.test(context.component)) {
    return false;
  }

  if (context.element && !/^[a-z][a-z0-9-]*$/.test(context.element)) {
    return false;
  }

  if (context.variant && !/^[a-z][a-z0-9-]*$/.test(context.variant)) {
    return false;
  }

  if (context.index !== undefined && (context.index < 0 || !Number.isInteger(context.index))) {
    return false;
  }

  return true;
}

/**
 * Creates a UI Identity context from a string path
 * @param path - The UI path string (e.g., "home.hero.cta.primary-button")
 * @returns A UiIdentityContext object
 */
export function parseUiPath(path: string): UiIdentityContext {
  const parts = path.split('.');
  
  return {
    feature: parts[0] || '',
    section: parts[1],
    component: parts[2],
    element: parts[3],
    variant: parts[4],
  };
}

/**
 * Merges multiple UI Identity contexts
 * @param contexts - Array of contexts to merge (later contexts override earlier ones)
 * @returns A merged UiIdentityContext object
 */
export function mergeUiIdentityContexts(...contexts: UiIdentityContext[]): UiIdentityContext {
  return contexts.reduce<UiIdentityContext>(
    (merged, context) => ({
      ...merged,
      ...context,
    }),
    { feature: '' }
  );
}
