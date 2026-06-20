/**
 * UI Platform — client-safe entry point (Identity, Registry, i18n hooks, Ui* runtime).
 * For server-only APIs (cookies, dictionaries), use @/platform/ui/server.
 */

/**
 * UI Platform — UUID-first identity, registry, i18n hooks.
 * For server-only APIs (cookies, dictionaries), use @/platform/ui/server.
 */

export {
  UI_UUID_MAP,
  ALL_UI_IDENTITIES,
  ALL_UI_IDENTIFIERS,
  FEATURE_MAP,
  UI_REGISTRY,
  HOME,
  SPLASH,
  ERROR_BOUNDARY,
  SHARED_LAYOUT,
  AUTH,
  SETTINGS,
  MERCHANT,
  ONBOARDING,
  getUiIdentityByUuid,
  getUiIdentity,
  resolveUiIdentity,
  getUiIdentityByFeature,
  getUiIdentityLifecycle,
  isUiIdentityDeprecated,
  isUiIdentity,
  isTranslationRequiredForUiIdentity,
  resolveSourceFromIdentity,
  isValidUiIdentifier,
  isRegisteredUiIdentifier,
  createDeterministicUiUuid,
  getUiIdentityUuid,
  isValidUiUuid,
} from './registry/registry';
export type { UiIdentity, UiParam, UiIdentifier, UiSourceLocation } from './registry/registry';
export * from './registry/categories';
export { UI_REGISTRY_CONFIG } from './registry/config';
export * from './registry/generator';
export { UI_SOURCE_INDEX_BY_UUID } from './registry/source-index';
// uiUuid() removed — use data-ui-uuid={IDENTITY.uuid} only
// i18n (client)
export { I18nProvider, useI18nContext } from './i18n/core/provider';
export { useTranslation } from './i18n/core/useTranslation';
export { t } from './i18n/core/t';
export { validateTranslationKey } from './i18n/core/enforceBoundary';
export type { Locale, Feature, TranslationDictionary } from './i18n/core/types';
export type { TranslationKey } from './i18n/keys';
export type { TranslateFn, TranslationSource } from './i18n/core/resolveTranslationSource';
export { resolveTranslationKey } from './i18n/core/resolveTranslationSource';
export { resolveFeatureScope, FEATURE_SCOPES } from './i18n/core/featureScope';
export { resolveFeatureFromPathname, I18N_ROUTE_MANIFEST } from './i18n/core/i18n-route-manifest';
export { boundTranslation } from './i18n/binding/boundTranslation';
export { getDirection, getEffectiveTheme } from './i18n/utils/getLocale';
export { LocaleProvider } from './i18n/LocaleProvider';

// i18n binding (UI ↔ translation)
export * from './i18n/binding/registry-binding';
export * from './i18n/binding/useBoundUI';
export { warnOnTranslationMismatch } from './i18n/binding/translation-validator';

// Telemetry & testing
export * from './telemetry/ui-telemetry';
export * from './telemetry/test-helpers';

// DevTools
export { DevUiOverlay } from './devtools/DevUiOverlay';
