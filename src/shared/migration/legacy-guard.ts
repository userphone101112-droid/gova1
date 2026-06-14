/**
 * Runtime Safety Layer
 * 
 * Detects runtime violations in DEV mode only
 * Warns about missing translations, UI bindings, and hardcoded text
 * NO PRODUCTION IMPACT
 */

import React from 'react';

const IS_DEV = process.env.NODE_ENV === 'development';

interface LegacyGuardWarning {
  type: 'missing_translation' | 'missing_ui_binding' | 'hardcoded_text';
  message: string;
  location: string | undefined;
  timestamp: number;
}

/**
 * Check if legacy guard is enabled
 */
export function isLegacyGuardEnabled(): boolean {
  return IS_DEV;
}

/**
 * Log a legacy guard warning
 */
function logWarning(warning: LegacyGuardWarning): void {
  if (!IS_DEV) {
    return;
  }
  
  console.warn(`⚠️  [LEGACY GUARD] ${warning.type.toUpperCase()}: ${warning.message}`);
  if (warning.location) {
    console.warn(`   Location: ${warning.location}`);
  }
}

/**
 * Warn about missing translation
 */
export function warnMissingTranslation(key: string, location?: string): void {
  if (!IS_DEV) {
    return;
  }
  
  const warning: LegacyGuardWarning = {
    type: 'missing_translation',
    message: `Translation key "${key}" is missing or not loaded`,
    location,
    timestamp: Date.now(),
  };
  
  logWarning(warning);
}

/**
 * Warn about missing UI binding
 */
export function warnMissingUiBinding(uiIdentifier: string, location?: string): void {
  if (!IS_DEV) {
    return;
  }
  
  const warning: LegacyGuardWarning = {
    type: 'missing_ui_binding',
    message: `UI identifier "${uiIdentifier}" is missing translation binding`,
    location,
    timestamp: Date.now(),
  };
  
  logWarning(warning);
}

/**
 * Warn about hardcoded text
 */
export function warnHardcodedText(text: string, location?: string): void {
  if (!IS_DEV) {
    return;
  }
  
  const warning: LegacyGuardWarning = {
    type: 'hardcoded_text',
    message: `Hardcoded text detected: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    location,
    timestamp: Date.now(),
  };
  
  logWarning(warning);
}

/**
 * Validate translation key exists
 */
export function validateTranslationKey(key: string, availableKeys: Set<string>, location?: string): boolean {
  if (!IS_DEV) {
    return true; // Skip validation in production
  }
  
  if (!availableKeys.has(key)) {
    warnMissingTranslation(key, location);
    return false;
  }
  
  return true;
}

/**
 * Validate UI identifier has binding
 */
export function validateUiBinding(uiIdentifier: string, bindingMap: Record<string, string>, location?: string): boolean {
  if (!IS_DEV) {
    return true; // Skip validation in production
  }
  
  if (!bindingMap[uiIdentifier]) {
    warnMissingUiBinding(uiIdentifier, location);
    return false;
  }
  
  return true;
}

/**
 * Check for hardcoded text in JSX
 */
export function checkForHardcodedText(text: string, location?: string): boolean {
  if (!IS_DEV) {
    return true; // Skip validation in production
  }
  
  // Skip if it's too short or looks like code
  if (!text || text.length < 2 || /^[A-Z_\-0-9]+$/.test(text)) {
    return true;
  }
  
  warnHardcodedText(text, location);
  return false;
}

/**
 * Legacy guard hook for React components
 */
export function useLegacyGuard(componentName: string) {
  if (!IS_DEV) {
    return {
      warnMissingTranslation,
      warnMissingUiBinding,
      warnHardcodedText,
      validateTranslationKey,
      validateUiBinding,
      checkForHardcodedText,
    };
  }
  
  console.log(`🔍 [LEGACY GUARD] Monitoring component: ${componentName}`);
  
  return {
    warnMissingTranslation: (key: string) => warnMissingTranslation(key, componentName),
    warnMissingUiBinding: (uiIdentifier: string) => warnMissingUiBinding(uiIdentifier, componentName),
    warnHardcodedText: (text: string) => warnHardcodedText(text, componentName),
    validateTranslationKey: (key: string, availableKeys: Set<string>) => 
      validateTranslationKey(key, availableKeys, componentName),
    validateUiBinding: (uiIdentifier: string, bindingMap: Record<string, string>) => 
      validateUiBinding(uiIdentifier, bindingMap, componentName),
    checkForHardcodedText: (text: string) => checkForHardcodedText(text, componentName),
  };
}

/**
 * Runtime validation wrapper for translation function
 */
export function createGuardedTranslationFunction(
  t: (key: string) => string,
  availableKeys: Set<string>,
  location?: string
): (key: string) => string {
  if (!IS_DEV) {
    return t; // No wrapping in production
  }
  
  return (key: string) => {
    validateTranslationKey(key, availableKeys, location);
    return t(key);
  };
}

/**
 * Runtime validation wrapper for UI component
 */
export function createGuardedUiComponent(
  Component: React.ComponentType<any>,
  bindingMap: Record<string, string>,
  location?: string
): React.ComponentType<any> {
  if (!IS_DEV) {
    return Component; // No wrapping in production
  }
  
  return function GuardedComponent(props: any) {
    const { ui } = props;
    
    if (ui) {
      validateUiBinding(ui, bindingMap, location);
    }
    
    return React.createElement(Component, props);
  };
}

/**
 * Get legacy guard statistics (DEV mode only)
 */
export function getLegacyGuardStats(): {
  enabled: boolean;
  warnings: LegacyGuardWarning[];
  totalWarnings: number;
  byType: Record<string, number>;
} {
  if (!IS_DEV) {
    return {
      enabled: false,
      warnings: [],
      totalWarnings: 0,
      byType: {},
    };
  }
  
  // In a real implementation, this would track warnings
  // For now, return empty stats
  return {
    enabled: true,
    warnings: [],
    totalWarnings: 0,
    byType: {},
  };
}
