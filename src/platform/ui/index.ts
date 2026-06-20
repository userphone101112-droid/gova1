/**
 * UI Platform — client-safe entry point (Identity, Registry, i18n hooks, Ui* runtime).
 * For server-only APIs (cookies, dictionaries), use @/platform/ui/server.
 */

// Registry & Identity
export * from './registry/registry';
export * from './registry/categories';
export type { UiIdentity } from './registry/types';
export { UI_REGISTRY_CONFIG } from './registry/config';
export * from './registry/generator';
export { UI_SOURCE_INDEX, UI_SOURCE_INDEX_BY_UUID } from './registry/source-index';
export type { UiSourceLocation } from './registry/source-index';

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

// Runtime components (Ui*)
export * from './runtime/public-api';

// Telemetry & testing
export * from './telemetry/ui-telemetry';
export * from './telemetry/test-helpers';

// DevTools
export { DevUiOverlay } from './devtools/DevUiOverlay';
