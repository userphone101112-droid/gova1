import { UI_SOURCE_INDEX, type UiSourceLocation } from './source-index';
import { ALL_CATEGORY_IDENTITIES } from './categories';
import type { UiIdentity } from './types';

export type { UiSourceLocation } from './source-index';
export type { UiIdentity } from './types';

export { HOME } from './features/home';
export { SPLASH } from './features/splash';
export { ERROR_BOUNDARY } from './features/error-boundary';
export { SHARED_LAYOUT } from './features/shared-layout';
export { AUTH } from './features/auth';
export { SETTINGS } from './features/settings';

import { HOME } from './features/home';
import { SPLASH } from './features/splash';
import { ERROR_BOUNDARY } from './features/error-boundary';
import { SHARED_LAYOUT } from './features/shared-layout';
import { AUTH } from './features/auth';
import { SETTINGS } from './features/settings';

// ============================================================================
// REGISTRY VALIDATION
// ============================================================================

export const UI_REGISTRY = {
  HOME,
  ERROR_BOUNDARY,
  SPLASH,
  SHARED_LAYOUT,
  AUTH,
  SETTINGS,
} as const;

function flattenObject(obj: any): any[] {
  const result: any[] = [];
  function recurse(current: any) {
    if (typeof current === 'object' && current !== null) {
      if ('id' in current && 'path' in current) {
        result.push(current);
      } else {
        Object.values(current).forEach(recurse);
      }
    }
  }
  recurse(obj);
  return result;
}

export const ALL_UI_IDENTITIES = [
  ...flattenObject(HOME),
  ...flattenObject(ERROR_BOUNDARY),
  ...flattenObject(SPLASH),
  ...flattenObject(SHARED_LAYOUT),
  ...flattenObject(AUTH),
  ...flattenObject(SETTINGS),
  ...ALL_CATEGORY_IDENTITIES,
] as readonly UiIdentity[];

export const ALL_UI_IDENTIFIERS = ALL_UI_IDENTITIES.map((id) => id.path) as readonly string[];

/**
 * Type for all valid UI identifiers (backward compatibility)
 */
export type UiIdentifier = typeof ALL_UI_IDENTIFIERS[number];

/**
 * Type for UI identifier parameter (backward compatibility)
 */
export type UiParam = UiIdentifier | UiIdentity;

/**
 * UI identifiers that do not require explicit bound translations (e.g., dynamic-only content).
 */
export const NO_TRANSLATION_REQUIRED: readonly UiIdentifier[] = [] as const;

// ============================================================================
// CENTRAL LOOKUP MAPS & HELPERS (PHASE 2)
// ============================================================================

export const UI_ID_MAP: Record<string, UiIdentity> = ALL_UI_IDENTITIES.reduce((acc, identity) => {
  acc[identity.id] = identity;
  return acc;
}, {} as Record<string, UiIdentity>);

export const UI_PATH_MAP: Record<string, UiIdentity> = ALL_UI_IDENTITIES.reduce((acc, identity) => {
  acc[identity.path] = identity;
  return acc;
}, {} as Record<string, UiIdentity>);

export const FEATURE_MAP: Record<string, UiIdentity[]> = ALL_UI_IDENTITIES.reduce((acc, identity) => {
  if (!acc[identity.feature]) {
    acc[identity.feature] = [];
  }
  acc[identity.feature].push(identity);
  return acc;
}, {} as Record<string, UiIdentity[]>);

export function getUiIdentityById(id: string): UiIdentity | undefined {
  return UI_ID_MAP[id];
}

export function getUiIdentityByPath(path: string): UiIdentity | undefined {
  return UI_PATH_MAP[path];
}

export function isUiIdentity(obj: any): obj is UiIdentity {
  return obj && typeof obj === 'object' && 'id' in obj && 'path' in obj;
}

export function resolveUiParam(param: UiParam): UiIdentity | undefined {
  if (typeof param === 'string') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[UI Registry Deprecation] Legacy string-based UI identity "${param}" is deprecated. ` +
        `Please use the registered registry object constant instead.`
      );
    }
    const resolved = getUiIdentityByPath(param);
    if (resolved && resolved.deprecated && process.env.NODE_ENV === 'development') {
      console.warn(`[UI Registry Deprecation] UI Identity "${resolved.id}" is deprecated.`);
    }
    return resolved;
  }
  
  if (param && param.deprecated && process.env.NODE_ENV === 'development') {
    console.warn(`[UI Registry Deprecation] UI Identity "${param.id}" is deprecated.`);
  }
  return param;
}

export function getUiIdentity(param: UiParam): UiIdentity | undefined {
  if (typeof param === 'string') {
    return getUiIdentityByPath(param) || getUiIdentityById(param);
  }
  if (isUiIdentity(param)) {
    return getUiIdentityById(param.id);
  }
  return undefined;
}

export function getUiIdentityByFeature(feature: string): UiIdentity[] {
  return FEATURE_MAP[feature] || [];
}

export function resolveSourceFromIdentity(param: UiParam): UiSourceLocation | undefined {
  const identity = getUiIdentity(param);
  if (!identity) return undefined;
  return UI_SOURCE_INDEX[identity.id];
}

/**
 * Validation regex for UI identifier naming convention
 * Pattern: page.section.component.element
 */
/** page.section.element or page.section.component.element */
export const UI_IDENTIFIER_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+){2,3}$/;

/**
 * Validate a UI identifier against the naming convention
 */
export function isValidUiIdentifier(identifier: string): boolean {
  return UI_IDENTIFIER_REGEX.test(identifier);
}

/**
 * Check if an identifier is registered in the registry
 */
export function isRegisteredUiIdentifier(identifier: string): boolean {
  return ALL_UI_IDENTIFIERS.includes(identifier);
}

/**
 * Get all duplicate identifiers (should always return empty array)
 */
export function getDuplicateIdentifiers(): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  
  ALL_UI_IDENTIFIERS.forEach((identifier) => {
    if (seen.has(identifier)) {
      duplicates.push(identifier);
    }
    seen.add(identifier);
  });
  
  return duplicates;
}

/**
 * Get all duplicate Stable IDs (should always return empty array)
 */
export function getDuplicateStableIds(): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  
  ALL_UI_IDENTITIES.forEach((identity) => {
    if (seen.has(identity.id)) {
      duplicates.push(identity.id);
    }
    seen.add(identity.id);
  });
  
  return duplicates;
}

/**
 * Production-safe runtime validation helper for identified components.
 * Warns in development mode only; does not affect production execution.
 */
export function validateRuntimeIdentity(
  componentName: string,
  ui: UiParam,
  resolvedIdentity: UiIdentity | undefined
): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // 1. Detect missing or invalid identity
  if (!resolvedIdentity) {
    console.error(
      `[UI Registry Error] Unknown UI Identity.\n` +
      ` - Component: ${componentName}\n` +
      ` - Provided: ${JSON.stringify(ui)}\n` +
      ` - Fix: Register this UI Identity in 'src/platform/ui/registry/registry.ts' before using it.`
    );
    return;
  }

  // 2. Validate data-ui-path matches registry
  const expectedId = typeof ui === 'object' && ui !== null ? ui.id : undefined;
  if (expectedId && resolvedIdentity.id !== expectedId) {
    console.error(
      `[UI Registry Error] Broken UI Identity Mapping.\n` +
      ` - Component: ${componentName}\n` +
      ` - Path: "${resolvedIdentity.path}"\n` +
      ` - Expected ID: "${resolvedIdentity.id}"\n` +
      ` - Provided ID: "${expectedId}"\n` +
      ` - Fix: Use the registered registry object constant instead of creating ad-hoc objects.`
    );
  }

  // 3. Warn about deprecated identity
  if (resolvedIdentity.deprecated) {
    console.warn(
      `[UI Registry Deprecation] UI Identity "${resolvedIdentity.id}" (path: "${resolvedIdentity.path}") is deprecated.`
    );
  }
}

/**
 * Validate the entire registry
 * Throws an error if validation fails
 */
export function validateRegistry(): void {
  const duplicates = getDuplicateIdentifiers();
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate UI paths found in registry: ${duplicates.join(', ')}`
    );
  }

  const duplicateIds = getDuplicateStableIds();
  if (duplicateIds.length > 0) {
    throw new Error(
      `Duplicate UI Stable IDs found in registry: ${duplicateIds.join(', ')}`
    );
  }
  
  const invalidIdentifiers = ALL_UI_IDENTIFIERS.filter(
    (identifier) => !isValidUiIdentifier(identifier)
  );
  
  if (invalidIdentifiers.length > 0) {
    throw new Error(
      `Invalid UI paths found (must match pattern page.section.component.element): ${invalidIdentifiers.join(', ')}`
    );
  }
}

// Auto-validate registry at module load time
validateRegistry();
