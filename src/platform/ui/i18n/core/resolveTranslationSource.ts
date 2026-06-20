import { isTranslationRequiredForUiIdentity } from '../../registry/registry';
import type { UiIdentity } from '../../registry/types';
import {
  generateTranslationKeyFromUi,
  isCategoryUiPath,
} from '../binding/registry-binding';
import type { TranslationKey } from '../keys';

export type TranslationSource = TranslationKey | UiIdentity;

export type TranslateFn = (source: TranslationSource, fallback?: string) => string;

function isUiIdentityObject(source: TranslationSource): source is UiIdentity {
  return typeof source === 'object' && source !== null && 'uuid' in source && 'path' in source;
}

/**
 * Resolve any translation source (UI identity or explicit key) to a TranslationKey.
 */
export function resolveTranslationKey(source: TranslationSource): TranslationKey | null {
  if (isUiIdentityObject(source)) {
    if (isCategoryUiPath(source.path) || !isTranslationRequiredForUiIdentity(source)) {
      return null;
    }
    return generateTranslationKeyFromUi(source.path) as TranslationKey;
  }

  if (typeof source === 'string') {
    return source as TranslationKey;
  }

  return null;
}
