/**
 * Unified UI + i18n Binding Layer
 * 
 * This module provides the core rule engine that enforces structural coupling
 * between UI Identifiers and Translation Keys, ensuring zero orphan elements
 * and complete architectural consistency.
 */

import type { UiIdentifier } from '@/shared/ui-registry';

/**
 * Binding Record - Represents a validated coupling between UI and i18n
 */
export interface BindingRecord {
  ui: UiIdentifier;
  translationKey: string;
  feature: string;
  page: string;
  section: string;
  component: string;
  element: string;
}

/**
 * Binding Validation Result
 */
export interface BindingValidationResult {
  isValid: boolean;
  errors: BindingError[];
  warnings: BindingWarning[];
}

/**
 * Binding Error Types
 */
export enum BindingErrorType {
  MISSING_TRANSLATION = 'MISSING_TRANSLATION',
  MISSING_UI_IDENTIFIER = 'MISSING_UI_IDENTIFIER',
  CROSS_FEATURE_MAPPING = 'CROSS_FEATURE_MAPPING',
  INVALID_FORMAT = 'INVALID_FORMAT',
  ORPHAN_TRANSLATION = 'ORPHAN_TRANSLATION',
  ORPHAN_UI_IDENTIFIER = 'ORPHAN_UI_IDENTIFIER',
  MISSING_LANGUAGE_PAIR = 'MISSING_LANGUAGE_PAIR',
}

/**
 * Binding Error
 */
export interface BindingError {
  type: BindingErrorType;
  ui?: UiIdentifier;
  translationKey?: string;
  message: string;
  feature?: string;
}

/**
 * Binding Warning
 */
export interface BindingWarning {
  type: string;
  message: string;
  ui?: UiIdentifier;
  translationKey?: string;
}

/**
 * Extract feature from UI identifier
 * UI format: page.section.component.element
 * Feature is the first part (page)
 */
export function extractFeatureFromUiIdentifier(ui: UiIdentifier): string {
  const parts = ui.split('.');
  if (parts.length === 0) {
    throw new Error(`Invalid UI identifier format: ${ui}`);
  }
  return parts[0];
}

/**
 * Extract page from UI identifier
 * UI format: page.section.component.element
 * Page is the first part (same as feature in this architecture)
 */
export function extractPageFromUiIdentifier(ui: UiIdentifier): string {
  return extractFeatureFromUiIdentifier(ui);
}

/**
 * Extract section from UI identifier
 * UI format: page.section.component.element
 */
export function extractSectionFromUiIdentifier(ui: UiIdentifier): string {
  const parts = ui.split('.');
  if (parts.length < 2) {
    throw new Error(`Invalid UI identifier format: ${ui}`);
  }
  return parts[1];
}

/**
 * Extract component from UI identifier
 * UI format: page.section.component.element
 */
export function extractComponentFromUiIdentifier(ui: UiIdentifier): string {
  const parts = ui.split('.');
  if (parts.length < 3) {
    throw new Error(`Invalid UI identifier format: ${ui}`);
  }
  return parts[2];
}

/**
 * Extract element from UI identifier
 * UI format: page.section.component.element
 */
export function extractElementFromUiIdentifier(ui: UiIdentifier): string {
  const parts = ui.split('.');
  if (parts.length < 4) {
    throw new Error(`Invalid UI identifier format: ${ui}`);
  }
  return parts[3];
}

/**
 * Generate expected translation key from UI identifier
 * UI format: page.section.component.element
 * Translation format: page.section.element (kebab-case to camelCase conversion)
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
 * Validate UI identifier format
 * Expected format: page.section.component.element
 */
export function validateUiIdentifierFormat(ui: UiIdentifier): boolean {
  const parts = ui.split('.');
  return parts.length === 4 && parts.every(part => part.length > 0);
}

/**
 * Validate binding between UI identifier and translation key
 * Rules:
 * - UI identifier must have valid format
 * - Translation key must belong to same feature as UI identifier
 * - Translation key must follow expected pattern
 */
export function validateBinding(
  ui: UiIdentifier,
  translationKey: string,
  availableTranslationKeys: Set<string>
): BindingValidationResult {
  const errors: BindingError[] = [];
  const warnings: BindingWarning[] = [];
  
  // Validate UI identifier format
  if (!validateUiIdentifierFormat(ui)) {
    errors.push({
      type: BindingErrorType.INVALID_FORMAT,
      ui,
      message: `UI identifier "${ui}" has invalid format. Expected: page.section.component.element`,
    });
    return { isValid: false, errors, warnings };
  }
  
  // Extract feature from UI identifier
  const uiFeature = extractFeatureFromUiIdentifier(ui);
  
  // Extract feature from translation key
  const translationFeature = translationKey.split('.')[0];
  
  // Check for cross-feature mapping
  if (uiFeature !== translationFeature && translationFeature !== 'common') {
    errors.push({
      type: BindingErrorType.CROSS_FEATURE_MAPPING,
      ui,
      translationKey,
      feature: uiFeature,
      message: `UI identifier "${ui}" belongs to feature "${uiFeature}" but translation key "${translationKey}" belongs to feature "${translationFeature}". Cross-feature mapping is not allowed.`,
    });
  }
  
  // Check if translation key exists
  if (!availableTranslationKeys.has(translationKey)) {
    errors.push({
      type: BindingErrorType.MISSING_TRANSLATION,
      ui,
      translationKey,
      feature: uiFeature,
      message: `Translation key "${translationKey}" does not exist in translation registry for UI identifier "${ui}".`,
    });
  }
  
  // Generate expected translation key and check if it matches
  const expectedKey = generateTranslationKeyFromUi(ui);
  if (translationKey !== expectedKey && translationFeature !== 'common') {
    warnings.push({
      type: 'NAMING_MISMATCH',
      message: `UI identifier "${ui}" expects translation key "${expectedKey}" but found "${translationKey}". Consider aligning naming conventions.`,
      ui,
      translationKey,
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create a binding record from UI identifier
 */
export function createBindingRecord(ui: UiIdentifier): BindingRecord {
  if (!validateUiIdentifierFormat(ui)) {
    throw new Error(`Cannot create binding record for invalid UI identifier: ${ui}`);
  }
  
  return {
    ui,
    translationKey: generateTranslationKeyFromUi(ui),
    feature: extractFeatureFromUiIdentifier(ui),
    page: extractPageFromUiIdentifier(ui),
    section: extractSectionFromUiIdentifier(ui),
    component: extractComponentFromUiIdentifier(ui),
    element: extractElementFromUiIdentifier(ui),
  };
}

/**
 * Validate complete binding registry
 * Ensures no orphan UI identifiers or translations exist
 */
export function validateBindingRegistry(
  uiIdentifiers: UiIdentifier[],
  translationKeys: Set<string>,
  usedUiIdentifiers: Set<UiIdentifier>,
  usedTranslationKeys: Set<string>
): BindingValidationResult {
  const errors: BindingError[] = [];
  const warnings: BindingWarning[] = [];
  
  // Check for orphan UI identifiers (registered but never used)
  for (const ui of uiIdentifiers) {
    if (!usedUiIdentifiers.has(ui)) {
      warnings.push({
        type: 'ORPHAN_UI_IDENTIFIER',
        message: `UI identifier "${ui}" is registered but never used in any component.`,
        ui,
      });
    }
    
    // Check if UI identifier has corresponding translation
    const expectedKey = generateTranslationKeyFromUi(ui);
    if (!translationKeys.has(expectedKey)) {
      errors.push({
        type: BindingErrorType.MISSING_TRANSLATION,
        ui,
        translationKey: expectedKey,
        feature: extractFeatureFromUiIdentifier(ui),
        message: `UI identifier "${ui}" requires translation key "${expectedKey}" which does not exist.`,
      });
    }
  }
  
  // Check for orphan translations (exist but not used by any UI)
  for (const key of translationKeys) {
    if (!usedTranslationKeys.has(key)) {
      // Skip if it's a nested object key (not a leaf)
      const feature = key.split('.')[0];
      if (feature !== 'common') {
        warnings.push({
          type: 'ORPHAN_TRANSLATION',
          message: `Translation key "${key}" exists but is not used by any UI element.`,
          translationKey: key,
        });
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Type-safe binding map
 * Maps UI identifiers to their required translation keys
 */
export type BindingMap = Record<UiIdentifier, string>;

/**
 * Generate binding map from UI registry
 */
export function generateBindingMap(uiIdentifiers: UiIdentifier[]): BindingMap {
  const map: BindingMap = {} as BindingMap;
  
  for (const ui of uiIdentifiers) {
    if (validateUiIdentifierFormat(ui)) {
      map[ui] = generateTranslationKeyFromUi(ui);
    }
  }
  
  return map;
}

/**
 * Get all binding records for a feature
 */
export function getFeatureBindings(
  feature: string,
  uiIdentifiers: UiIdentifier[]
): BindingRecord[] {
  return uiIdentifiers
    .filter(ui => extractFeatureFromUiIdentifier(ui) === feature)
    .map(createBindingRecord);
}
