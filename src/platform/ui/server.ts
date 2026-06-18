/**
 * Server-only UI Platform APIs (Next.js App Router).
 * Do not import from Client Components — use @/platform/ui instead.
 */

export { getLocale, getThemeMode, getSSOTPreferences } from './i18n/utils/getLocale.server';
export type { SSOTPreferences } from './i18n/utils/getLocale.server';
export { getDirection, getEffectiveTheme } from './i18n/utils/getLocale';
export {
  getDictionary,
  getDictionaryCached,
  getAppDictionary,
  getAppDictionaryCached,
  getMergedDictionary,
  clearDictionaryCache,
  getDictionaryCacheStats,
} from './i18n/core/getDictionary';
export { createFeatureLayout, createFeaturePage } from './i18n/utils/createFeatureLayout';
export { discoverFeatures, getAvailableFeatures, featureExists } from './i18n/utils/discoverFeatures';
