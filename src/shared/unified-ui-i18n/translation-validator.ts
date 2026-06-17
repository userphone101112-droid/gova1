/**
 * Translation Validator
 * 
 * Helper functions to validate that translation keys used in components
 * match the expected translation keys derived from UI identifiers.
 * This prevents the error where a component uses a translation key that
 * doesn't match its UI identifier.
 */

import type { UiIdentifier } from '@/shared/ui-registry/types';

/**
 * Generates the expected translation key from a UI identifier
 * Format: page.section.element (kebab-case to camelCase conversion)
 */
export function generateTranslationKeyFromUi(ui: UiIdentifier): string {
  const parts = ui.split('.');
  if (parts.length < 4) {
    throw new Error(`Invalid UI identifier format: ${ui}`);
  }

  const page = parts[0];
  const section = parts[1];
  const element = parts[3]; // Use element, not component

  // Convert kebab-case to camelCase for the element part
  const camelCaseElement = element.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  return `${page}.${section}.${camelCaseElement}`;
}

/**
 * Validates that a translation key matches the expected key from a UI identifier
 * @param ui - The UI identifier
 * @param translationKey - The translation key used in the component
 * @returns true if the translation key matches, false otherwise
 */
export function validateTranslationKey(ui: UiIdentifier, translationKey: string): boolean {
  const expectedKey = generateTranslationKeyFromUi(ui);
  return translationKey === expectedKey;
}

/**
 * Gets the expected translation key for a UI identifier
 * This should be used in components to ensure they use the correct translation key
 * @param ui - The UI identifier
 * @returns The expected translation key
 */
export function getExpectedTranslationKey(ui: UiIdentifier): string {
  return generateTranslationKeyFromUi(ui);
}

/**
 * Validates all translation keys used in a component
 * @param uiIdentifier - The UI identifier
 * @param translationKeys - The translation keys used in the component
 * @returns Array of validation errors
 */
export function validateComponentTranslations(
  uiIdentifier: UiIdentifier,
  translationKeys: string[]
): string[] {
  const errors: string[] = [];
  const expectedKey = generateTranslationKeyFromUi(uiIdentifier);

  for (const key of translationKeys) {
    if (key !== expectedKey) {
      errors.push(
        `Translation key "${key}" does not match expected key "${expectedKey}" for UI identifier "${uiIdentifier}"`
      );
    }
  }

  return errors;
}

/**
 * Logs a warning if a translation key doesn't match the expected key
 * This should be used in development to catch translation key mismatches early
 * @param ui - The UI identifier
 * @param translationKey - The translation key used in the component
 */
export function warnOnTranslationMismatch(ui: UiIdentifier, translationKey: string): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const expectedKey = generateTranslationKeyFromUi(ui);
    if (translationKey !== expectedKey) {
      console.warn(
        `[Translation Mismatch] UI identifier "${ui}" expects translation key "${expectedKey}" but got "${translationKey}"`
      );
    }
  }
}
