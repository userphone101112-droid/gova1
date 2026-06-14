/**
 * Centralized UI Registry
 * 
 * This is the single source of truth for all UI identifiers in the application.
 * Every interactive element MUST use an identifier from this registry.
 * 
 * Naming convention: page.section.component.element
 * Pattern: ^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$
 * 
 * To add a new identifier:
 * 1. Add it to the appropriate section below
 * 2. Follow the naming convention strictly
 * 3. Ensure uniqueness (no duplicates allowed)
 * 4. The identifier will be automatically validated at build time
 */

// ============================================================================
// AUTHENTICATION PAGE IDENTIFIERS
// ============================================================================
export const AUTH = {
  LOGIN: {
    FORM: {
      SUBMIT_BUTTON: 'auth.login.form.submit-button' as const,
      EMAIL_INPUT: 'auth.login.form.email-input' as const,
      PASSWORD_INPUT: 'auth.login.form.password-input' as const,
    },
  },
  REGISTER: {
    FORM: {
      SUBMIT_BUTTON: 'auth.register.form.submit-button' as const,
      EMAIL_INPUT: 'auth.register.form.email-input' as const,
      PASSWORD_INPUT: 'auth.register.form.password-input' as const,
    },
  },
} as const;

// ============================================================================
// HOME PAGE IDENTIFIERS
// ============================================================================
export const HOME = {
  LANGUAGE_SWITCHER: {
    ENGLISH_BUTTON: 'home.language-switcher.english-button' as const,
    ARABIC_BUTTON: 'home.language-switcher.arabic-button' as const,
  },
  HERO: {
    CTA: {
      PRIMARY_BUTTON: 'home.hero.cta.primary-button' as const,
      SECONDARY_BUTTON: 'home.hero.cta.secondary-button' as const,
    },
  },
} as const;

// ============================================================================
// DASHBOARD PAGE IDENTIFIERS
// ============================================================================
export const DASHBOARD = {
  SIDEBAR: {
    NAVIGATION: {
      USERS_LINK: 'dashboard.sidebar.navigation.users-link' as const,
      SETTINGS_LINK: 'dashboard.sidebar.navigation.settings-link' as const,
      ANALYTICS_LINK: 'dashboard.sidebar.navigation.analytics-link' as const,
    },
  },
  HEADER: {
    LOGOUT_BUTTON: 'dashboard.header.logout-button' as const,
    PROFILE_BUTTON: 'dashboard.header.profile-button' as const,
  },
} as const;

// ============================================================================
// SETTINGS PAGE IDENTIFIERS
// ============================================================================
export const SETTINGS = {
  LANGUAGE: {
    SELECTOR: {
      CURRENT_LANGUAGE: 'settings.language.selector.current-language' as const,
    },
  },
  NOTIFICATIONS: {
    TOGGLE: {
      EMAIL_NOTIFICATIONS: 'settings.notifications.toggle.email-notifications' as const,
      PUSH_NOTIFICATIONS: 'settings.notifications.toggle.push-notifications' as const,
    },
  },
} as const;

// ============================================================================
// CONTACT PAGE IDENTIFIERS
// ============================================================================
export const CONTACT = {
  FORM: {
    SUBMIT_BUTTON: 'contact.form.submit-button' as const,
    EMAIL_INPUT: 'contact.form.email-input' as const,
    SUBJECT_INPUT: 'contact.form.subject-input' as const,
    MESSAGE_TEXTAREA: 'contact.form.message-textarea' as const,
  },
} as const;

// ============================================================================
// ERROR BOUNDARY IDENTIFIERS
// ============================================================================
export const ERROR_BOUNDARY = {
  RELOAD_BUTTON: 'error-boundary.reload-button' as const,
} as const;

// ============================================================================
// SIGNUP PAGE IDENTIFIERS
// ============================================================================
export const SIGNUP = {
  FORM: {
    SUBMIT_BUTTON: 'signup.form.submit-button' as const,
    EMAIL_INPUT: 'signup.form.email-input' as const,
    PASSWORD_INPUT: 'signup.form.password-input' as const,
    TERMS_CHECKBOX: 'signup.form.terms-checkbox' as const,
  },
} as const;

// ============================================================================
// SPLASH PAGE IDENTIFIERS
// ============================================================================
export const SPLASH = {
  MAINTENANCE: {
    FORM: {
      PIN_INPUT: 'splash.maintenance.form.pin-input' as const,
      SUBMIT_BUTTON: 'splash.maintenance.form.submit-button' as const,
    },
  },
} as const;

// ============================================================================
// REGISTRY VALIDATION
// ============================================================================

/**
 * All registered UI identifiers
 * This is used for validation and uniqueness checks
 */
export const UI_REGISTRY = {
  ...AUTH,
  ...HOME,
  ...DASHBOARD,
  ...SETTINGS,
  ...CONTACT,
  ...ERROR_BOUNDARY,
  ...SIGNUP,
  ...SPLASH,
} as const;

/**
 * Extract all identifier values for validation
 */
export const ALL_UI_IDENTIFIERS = Object.values(UI_REGISTRY).reduce<string[]>(
  (acc, value) => {
    if (typeof value === 'string') {
      acc.push(value);
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach((nestedValue) => {
        if (typeof nestedValue === 'string') {
          acc.push(nestedValue);
        } else if (typeof nestedValue === 'object' && nestedValue !== null) {
          Object.values(nestedValue).forEach((deepValue) => {
            if (typeof deepValue === 'string') {
              acc.push(deepValue);
            } else if (typeof deepValue === 'object' && deepValue !== null) {
              Object.values(deepValue).forEach((deepestValue) => {
                if (typeof deepestValue === 'string') {
                  acc.push(deepestValue);
                }
              });
            }
          });
        }
      });
    }
    return acc;
  },
  []
) as readonly string[];

/**
 * Type for all valid UI identifiers
 */
export type UiIdentifier = typeof ALL_UI_IDENTIFIERS[number];

/**
 * Validation regex for UI identifier naming convention
 * Pattern: page.section.component.element
 */
export const UI_IDENTIFIER_REGEX = /^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/;

/**
 * Validate a UI identifier against the naming convention
 */
export function isValidUiIdentifier(identifier: string): identifier is UiIdentifier {
  return UI_IDENTIFIER_REGEX.test(identifier);
}

/**
 * Check if an identifier is registered in the registry
 */
export function isRegisteredUiIdentifier(identifier: string): identifier is UiIdentifier {
  return ALL_UI_IDENTIFIERS.includes(identifier as any);
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
 * Validate the entire registry
 * Throws an error if validation fails
 */
export function validateRegistry(): void {
  const duplicates = getDuplicateIdentifiers();
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate UI identifiers found in registry: ${duplicates.join(', ')}`
    );
  }
  
  const invalidIdentifiers = ALL_UI_IDENTIFIERS.filter(
    (identifier) => !isValidUiIdentifier(identifier)
  );
  
  if (invalidIdentifiers.length > 0) {
    throw new Error(
      `Invalid UI identifiers found (must match pattern page.section.component.element): ${invalidIdentifiers.join(', ')}`
    );
  }
}

// Auto-validate registry at module load time
validateRegistry();
