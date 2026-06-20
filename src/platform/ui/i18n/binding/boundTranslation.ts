import type { UiParam } from '../../registry/registry';
import { resolveTranslationKey } from '../core/resolveTranslationSource';
import type { TranslationSource } from '../core/resolveTranslationSource';
import type { TranslationKey } from '../keys';

export type TranslateFn = (source: TranslationSource, fallback?: string) => string;

type KeyTranslateFn = (key: TranslationKey, fallback?: string) => string;

/**
 * Resolve translation for a UI identity using the platform binding rule.
 * Prefer useTranslation().t() which handles both keys and UI identities.
 */
export function boundTranslation(
  ui: UiParam,
  t: KeyTranslateFn | TranslateFn,
  fallback?: string
): string {
  const key = resolveTranslationKey(ui);
  if (!key) {
    return fallback ?? '';
  }
  return t(key, fallback);
}
