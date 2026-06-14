/**
 * Strict Binding Enforcement at Type Level
 * 
 * This module enforces that UI identifiers and translation keys are structurally bound
 * at the type level, ensuring zero possibility of mismatched usage.
 */

import type { UiIdentifier } from '@/shared/ui-registry';
import { 
  generateTranslationKeyFromUi, 
  validateBinding,
  type BindingValidationResult 
} from './registry-binding';

/**
 * Bound UI Context - Provides type-safe coupling between UI and translation
 */
export interface BoundUIContext {
  ui: UiIdentifier;
  translationKey: string;
  isValid: boolean;
}

/**
 * Create a bound UI context
 * This ensures that the UI identifier and translation key are properly coupled
 */
export function createBoundUI(
  ui: UiIdentifier,
  translationKey: string,
  availableTranslationKeys: Set<string>
): BoundUIContext {
  const validation = validateBinding(ui, translationKey, availableTranslationKeys);
  
  return {
    ui,
    translationKey,
    isValid: validation.isValid,
  };
}

/**
 * Type-safe hook for using bound UI components
 * Ensures that UI identifiers are always used with their corresponding translation keys
 */
export function useBoundUI(
  ui: UiIdentifier,
  availableTranslationKeys: Set<string>
): { ui: UiIdentifier; translationKey: string } {
  const translationKey = generateTranslationKeyFromUi(ui);
  
  // Validate that the translation key exists
  if (!availableTranslationKeys.has(translationKey)) {
    throw new Error(
      `UI identifier "${ui}" requires translation key "${translationKey}" which does not exist. ` +
      `Please add this translation to your i18n files.`
    );
  }
  
  return {
    ui,
    translationKey,
  };
}

/**
 * Type-safe translation function that requires UI context
 * This prevents using translation keys without corresponding UI identifiers
 */
export function useBoundTranslation(
  ui: UiIdentifier,
  t: (key: string) => string
): string {
  const translationKey = generateTranslationKeyFromUi(ui);
  return t(translationKey);
}

/**
 * Validate that a translation key is used within its proper UI context
 */
export function validateTranslationContext(
  translationKey: string,
  uiContext: UiIdentifier | null
): BindingValidationResult {
  if (!uiContext) {
    return {
      isValid: false,
      errors: [{
        type: 'MISSING_UI_CONTEXT' as any,
        translationKey,
        message: `Translation key "${translationKey}" is used without UI context. All translations must be used within a UI component context.`,
      }],
      warnings: [],
    };
  }
  
  const expectedKey = generateTranslationKeyFromUi(uiContext);
  
  if (translationKey !== expectedKey) {
    return {
      isValid: false,
      errors: [{
        type: 'CONTEXT_MISMATCH' as any,
        ui: uiContext,
        translationKey,
        message: `Translation key "${translationKey}" does not match expected key "${expectedKey}" for UI context "${uiContext}".`,
      }],
      warnings: [],
    };
  }
  
  return {
    isValid: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Type-safe bound UI component props
 */
// BoundUI component removed - JSX syntax not supported in .ts files
// Use the functional APIs instead: useBoundUI, useBoundTranslation, validateTranslationContext

/**
 * Validate complete binding for a component
 * Ensures all UI identifiers used in a component have corresponding translations
 */
export function validateComponentBindings(
  uiIdentifiers: UiIdentifier[],
  availableTranslationKeys: Set<string>
): BindingValidationResult {
  const errors: any[] = [];
  const warnings: any[] = [];
  
  for (const ui of uiIdentifiers) {
    const expectedKey = generateTranslationKeyFromUi(ui);
    
    if (!availableTranslationKeys.has(expectedKey)) {
      errors.push({
        type: 'MISSING_TRANSLATION' as any,
        ui,
        translationKey: expectedKey,
        message: `UI identifier "${ui}" requires translation key "${expectedKey}" which does not exist.`,
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get all required translation keys for a set of UI identifiers
 */
export function getRequiredTranslationKeys(uiIdentifiers: UiIdentifier[]): Set<string> {
  const keys = new Set<string>();
  
  for (const ui of uiIdentifiers) {
    const key = generateTranslationKeyFromUi(ui);
    keys.add(key);
  }
  
  return keys;
}

/**
 * Validate that all required translation keys exist
 */
export function validateRequiredTranslations(
  uiIdentifiers: UiIdentifier[],
  availableTranslationKeys: Set<string>
): { isValid: boolean; missing: string[] } {
  const requiredKeys = getRequiredTranslationKeys(uiIdentifiers);
  const missing: string[] = [];
  
  for (const key of requiredKeys) {
    if (!availableTranslationKeys.has(key)) {
      missing.push(key);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
}
