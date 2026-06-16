import { UI_SOURCE_INDEX, type UiSourceLocation } from './ui-source-index';
export type { UiSourceLocation };

export interface UiIdentity {
  readonly id: string;
  readonly path: string;
  readonly description: string;
  readonly category: 'action' | 'input' | 'navigation' | 'display' | 'container';
  readonly feature: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deprecated?: boolean;
}

// ============================================================================
// HOME PAGE IDENTIFIERS
// ============================================================================
export const HOME = {
  LANGUAGE_SWITCHER: {
    ENGLISH_BUTTON: {
      id: 'UI_HOME_LANG_ENGLISH',
      path: 'home.language-switcher.buttons.english-button',
      description: 'English language switcher button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    ARABIC_BUTTON: {
      id: 'UI_HOME_LANG_ARABIC',
      path: 'home.language-switcher.buttons.arabic-button',
      description: 'Arabic language switcher button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
  },
  PROMO_BANNER: {
    ACTION_BUTTON: {
      id: 'UI_HOME_PROMO_BANNER_ACTION',
      path: 'home.promo-banner.actions.banner-button',
      description: 'Promo banner call-to-action button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    TITLE: {
      id: 'UI_HOME_PROMO_BANNER_TITLE',
      path: 'home.promo-banner.display.title',
      description: 'Promo banner main heading',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    DESCRIPTION: {
      id: 'UI_HOME_PROMO_BANNER_DESCRIPTION',
      path: 'home.promo-banner.display.description',
      description: 'Promo banner description text',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    LOGO: {
      id: 'UI_HOME_PROMO_BANNER_LOGO',
      path: 'home.promo-banner.display.logo',
      description: 'Promo banner logo image',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
  },
  CURATED_OFFERS: {
    SHOW_MORE: {
      id: 'UI_HOME_CURATED_OFFERS_MORE',
      path: 'home.curated-offers.actions.show-more-button',
      description: 'Show more curated offers button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    ADD_TO_CART: {
      id: 'UI_HOME_CURATED_OFFERS_ADD_TO_CART',
      path: 'home.curated-offers.actions.add-to-cart-button',
      description: 'Add item to cart button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    ADD_TO_FAVORITES: {
      id: 'UI_HOME_CURATED_OFFERS_FAVORITE',
      path: 'home.curated-offers.actions.add-to-favorites-button',
      description: 'Add item to favorites button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    PRODUCT_IMAGE: {
      id: 'UI_HOME_CURATED_OFFERS_PRODUCT_IMAGE',
      path: 'home.curated-offers.display.product-image',
      description: 'Product image in curated offers',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    CATEGORY_LABEL: {
      id: 'UI_HOME_CURATED_OFFERS_CATEGORY_LABEL',
      path: 'home.curated-offers.display.category-label',
      description: 'Product category label',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    PRODUCT_TITLE: {
      id: 'UI_HOME_CURATED_OFFERS_PRODUCT_TITLE',
      path: 'home.curated-offers.display.product-title',
      description: 'Product title',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    PRICE_LABEL: {
      id: 'UI_HOME_CURATED_OFFERS_PRICE_LABEL',
      path: 'home.curated-offers.display.price-label',
      description: 'Product price label',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    SECTION_TITLE: {
      id: 'UI_HOME_CURATED_OFFERS_SECTION_TITLE',
      path: 'home.curated-offers.display.section-title',
      description: 'Curated offers section title',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    PROMO_TAG: {
      id: 'UI_HOME_CURATED_OFFERS_PROMO_TAG',
      path: 'home.curated-offers.display.promo-tag',
      description: 'Curated offers promo tag',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
  },
  HERO_SLIDER: {
    SLIDE_IMAGE: {
      id: 'UI_HOME_HERO_SLIDER_SLIDE_IMAGE',
      path: 'home.hero-slider.display.slide-image',
      description: 'Hero slider slide image',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    SLIDE_TITLE: {
      id: 'UI_HOME_HERO_SLIDER_SLIDE_TITLE',
      path: 'home.hero-slider.display.slide-title',
      description: 'Hero slider slide title',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    SLIDE_BADGE: {
      id: 'UI_HOME_HERO_SLIDER_SLIDE_BADGE',
      path: 'home.hero-slider.display.slide-badge',
      description: 'Hero slider slide badge',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
  },
  CATEGORIES_GRID: {
    TOGGLE: {
      id: 'UI_HOME_CATEGORIES_GRID_TOGGLE',
      path: 'home.categories-grid.actions.toggle-button',
      description: 'Toggle categories grid layout button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    ITEM: {
      id: 'UI_HOME_CATEGORIES_GRID_ITEM',
      path: 'home.categories-grid.actions.category-button',
      description: 'Select category button',
      category: 'action',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    CATEGORY_IMAGE: {
      id: 'UI_HOME_CATEGORIES_GRID_CATEGORY_IMAGE',
      path: 'home.categories-grid.display.category-image',
      description: 'Category image in grid',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    CATEGORY_NAME: {
      id: 'UI_HOME_CATEGORIES_GRID_CATEGORY_NAME',
      path: 'home.categories-grid.display.category-name',
      description: 'Category name label',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    SECTION_TITLE: {
      id: 'UI_HOME_CATEGORIES_GRID_SECTION_TITLE',
      path: 'home.categories-grid.display.section-title',
      description: 'Categories section title',
      category: 'display',
      feature: 'home',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
  },
} as const;

// ============================================================================
// SPLASH PAGE IDENTIFIERS
// ============================================================================
export const SPLASH = {
  LOGO: {
    IMAGE: {
      id: 'UI_SPLASH_LOGO_IMAGE',
      path: 'splash.logo.display.logo-image',
      description: 'Splash screen logo image',
      category: 'display',
      feature: 'splash',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
    HEADING: {
      id: 'UI_SPLASH_LOGO_HEADING',
      path: 'splash.logo.display.heading',
      description: 'Splash screen main heading',
      category: 'display',
      feature: 'splash',
      version: '1.0.0',
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
    } as const,
  },
  MAINTENANCE: {
    FORM: {
      PIN_INPUT: {
        id: 'UI_SPLASH_MAINT_PIN',
        path: 'splash.maintenance.form.pin-input',
        description: 'Developer bypass PIN input',
        category: 'input',
        feature: 'splash',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
      SUBMIT_BUTTON: {
        id: 'UI_SPLASH_MAINT_SUBMIT',
        path: 'splash.maintenance.form.submit-button',
        description: 'Bypass maintenance mode button',
        category: 'action',
        feature: 'splash',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
    },
  },
} as const;

// ============================================================================
// ERROR BOUNDARY IDENTIFIERS
// ============================================================================
export const ERROR_BOUNDARY = {
  RELOAD_BUTTON: {
    id: 'UI_ERROR_BOUNDARY_RELOAD',
    path: 'error-boundary.main.actions.reload-button',
    description: 'Reload button for crashed application state',
    category: 'action',
    feature: 'error-boundary',
    version: '1.0.0',
    createdAt: '2026-06-15',
    updatedAt: '2026-06-15',
  } as const,
} as const;

// ============================================================================
// SHARED LAYOUT IDENTIFIERS (Header + Bottom Nav — all pages except splash)
// ============================================================================
export const SHARED_LAYOUT = {
  HEADER: {
    MENU: {
      MENU_BUTTON: {
        id: 'UI_SHARED_HEADER_MENU',
        path: 'shared-layout.header.menu.menu-button',
        description: 'Toggle mobile menu button',
        category: 'action',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
    },
    BRAND: {
      BRAND_LINK: {
        id: 'UI_SHARED_HEADER_BRAND_LINK',
        path: 'shared-layout.header.brand.brand-link',
        description: 'Brand logo home link',
        category: 'navigation',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
    },
    ACTIONS: {
      SEARCH_BUTTON: {
        id: 'UI_SHARED_HEADER_SEARCH_BUTTON',
        path: 'shared-layout.header.actions.search-button',
        description: 'Trigger search button',
        category: 'action',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
      CART_BUTTON: {
        id: 'UI_SHARED_HEADER_CART_BUTTON',
        path: 'shared-layout.header.actions.cart-button',
        description: 'Header shopping cart button',
        category: 'action',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
      SEARCH_INPUT: {
        id: 'UI_SHARED_HEADER_SEARCH_INPUT',
        path: 'shared-layout.header.actions.search-input',
        description: 'Desktop header search input field',
        category: 'input',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
    },
  },
  BOTTOM_NAV: {
    ITEMS: {
      HOME_LINK: {
        id: 'UI_SHARED_BOTTOM_NAV_HOME',
        path: 'shared-layout.bottom-nav.items.home-link',
        description: 'Bottom navigation home link',
        category: 'navigation',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
      NOTIFICATIONS_LINK: {
        id: 'UI_SHARED_BOTTOM_NAV_NOTIFICATIONS',
        path: 'shared-layout.bottom-nav.items.notifications-link',
        description: 'Bottom navigation notifications link',
        category: 'navigation',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
      FAVORITES_LINK: {
        id: 'UI_SHARED_BOTTOM_NAV_FAVORITES',
        path: 'shared-layout.bottom-nav.items.favorites-link',
        description: 'Bottom navigation favorites link',
        category: 'navigation',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
      ORDERS_LINK: {
        id: 'UI_SHARED_BOTTOM_NAV_ORDERS',
        path: 'shared-layout.bottom-nav.items.orders-link',
        description: 'Bottom navigation orders link',
        category: 'navigation',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
      PROFILE_LINK: {
        id: 'UI_SHARED_BOTTOM_NAV_PROFILE',
        path: 'shared-layout.bottom-nav.items.profile-link',
        description: 'Bottom navigation profile link',
        category: 'navigation',
        feature: 'shared-layout',
        version: '1.0.0',
        createdAt: '2026-06-15',
        updatedAt: '2026-06-15',
      } as const,
    },
  },
  SIDEBAR: {
    CLOSE_BUTTON: {
      id: 'UI_SHARED_SIDEBAR_CLOSE',
      path: 'shared-layout.sidebar.actions.close-button',
      description: 'Close sidebar button',
      category: 'action',
      feature: 'shared-layout',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    LOGIN_BUTTON: {
      id: 'UI_SHARED_SIDEBAR_LOGIN',
      path: 'shared-layout.sidebar.actions.login-button',
      description: 'Login button in sidebar',
      category: 'action',
      feature: 'shared-layout',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    LANGUAGE_TOGGLE: {
      id: 'UI_SHARED_SIDEBAR_LANGUAGE',
      path: 'shared-layout.sidebar.actions.language-toggle',
      description: 'Language switcher button',
      category: 'action',
      feature: 'shared-layout',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    THEME_TOGGLE: {
      id: 'UI_SHARED_SIDEBAR_THEME',
      path: 'shared-layout.sidebar.actions.theme-toggle',
      description: 'Dark/light mode toggle',
      category: 'action',
      feature: 'shared-layout',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
  },
} as const;

// ============================================================================
// AUTH PAGE IDENTIFIERS
// ============================================================================
export const AUTH = {
  LOGIN: {
    LOGO: {
      id: 'UI_AUTH_LOGIN_LOGO',
      path: 'auth.login.display.logo',
      description: 'Login page logo',
      category: 'display',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    HEADING: {
      id: 'UI_AUTH_LOGIN_HEADING',
      path: 'auth.login.display.heading',
      description: 'Login page main heading',
      category: 'display',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    SUBHEADING: {
      id: 'UI_AUTH_LOGIN_SUBHEADING',
      path: 'auth.login.display.subheading',
      description: 'Login page subheading',
      category: 'display',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    PHONE_INPUT: {
      id: 'UI_AUTH_LOGIN_PHONE_INPUT',
      path: 'auth.login.form.phone-input',
      description: 'Login page phone number input',
      category: 'input',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    PASSWORD_INPUT: {
      id: 'UI_AUTH_LOGIN_PASSWORD_INPUT',
      path: 'auth.login.form.password-input',
      description: 'Login page password input',
      category: 'input',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    TOGGLE_PASSWORD_VISIBILITY: {
      id: 'UI_AUTH_LOGIN_TOGGLE_PASSWORD',
      path: 'auth.login.form.toggle-password-visibility',
      description: 'Toggle password visibility button',
      category: 'action',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    FORGOT_PASSWORD_LINK: {
      id: 'UI_AUTH_LOGIN_FORGOT_PASSWORD',
      path: 'auth.login.form.forgot-password-link',
      description: 'Forgot password link',
      category: 'navigation',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    LOGIN_BUTTON: {
      id: 'UI_AUTH_LOGIN_SUBMIT',
      path: 'auth.login.form.submit-button',
      description: 'Login form submit button',
      category: 'action',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    GUEST_LOGIN_BUTTON: {
      id: 'UI_AUTH_LOGIN_GUEST',
      path: 'auth.login.actions.guest-login-button',
      description: 'Guest login button',
      category: 'action',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    SIGNUP_LINK: {
      id: 'UI_AUTH_LOGIN_SIGNUP_LINK',
      path: 'auth.login.actions.signup-link',
      description: 'Sign up link',
      category: 'navigation',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    ENGLISH_LANGUAGE_LINK: {
      id: 'UI_AUTH_LOGIN_ENGLISH_LANG',
      path: 'auth.login.footer.english-language-link',
      description: 'English language switcher link',
      category: 'action',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
    DARK_MODE_TOGGLE: {
      id: 'UI_AUTH_LOGIN_DARK_MODE',
      path: 'auth.login.footer.dark-mode-toggle',
      description: 'Dark mode toggle button',
      category: 'action',
      feature: 'auth',
      version: '1.0.0',
      createdAt: '2026-06-16',
      updatedAt: '2026-06-16',
    } as const,
  },
} as const;

// ============================================================================
// REGISTRY VALIDATION
// ============================================================================

export const UI_REGISTRY = {
  HOME,
  ERROR_BOUNDARY,
  SPLASH,
  SHARED_LAYOUT,
  AUTH,
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
 * UI identifiers that do not require explicit bound translations (e.g., they use dynamic text or brand links).
 */
export const NO_TRANSLATION_REQUIRED: readonly UiIdentifier[] = [
  SHARED_LAYOUT.HEADER.BRAND.BRAND_LINK.path,
] as const;

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
export const UI_IDENTIFIER_REGEX = /^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/;

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
      ` - Fix: Register this UI Identity in 'src/shared/ui-registry.ts' before using it.`
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
