import { Feature } from './types';

/**
 * Enforce feature localization boundary
 * Features can only access their own dictionary and common dictionary
 * 
 * @param currentFeature - The feature requesting the translation
 * @param requestedFeature - The feature being accessed in the translation key
 * @throws Error if boundary violation detected
 */
export function enforceLocalizationBoundary(
  currentFeature: Feature,
  requestedFeature: string
): void {
  // Allow access to common dictionary namespaces
  const COMMON_NAMESPACES = ['common', 'navigation', 'buttons', 'validation', 'messages', 'shared-layout'];
  if (COMMON_NAMESPACES.includes(requestedFeature)) {
    return;
  }

  // Allow access to own dictionary
  if (requestedFeature === currentFeature) {
    return;
  }

  // Boundary violation detected
  throw new Error(
    `Localization boundary violation: Feature "${currentFeature}" cannot access translations from feature "${requestedFeature}". ` +
    `Features can only access their own dictionary and the common dictionary.`
  );
}

/**
 * Extract feature from translation key
 * @param key - Translation key in dot notation (e.g., "home.title")
 * @returns The feature name from the key
 */
export function extractFeatureFromKey(key: string): string {
  const parts = key.split('.');
  if (parts.length === 0) {
    return 'common'; // Default to common if no namespace
  }
  return parts[0];
}

/**
 * Validate translation key respects localization boundary
 * @param key - Translation key to validate
 * @param currentFeature - The current feature context
 * @throws Error if boundary violation detected
 */
export function validateTranslationKey(key: string, currentFeature: Feature): void {
  const requestedFeature = extractFeatureFromKey(key);
  enforceLocalizationBoundary(currentFeature, requestedFeature);
}
