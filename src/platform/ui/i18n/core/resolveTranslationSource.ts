import type { UiIdentifier, UiParam } from '../../registry/registry';
import { resolveUiParam } from '../../registry/registry';
import {
  generateTranslationKeyFromUi,
  isCategoryUiPath,
  validateUiIdentifierFormat,
} from '../binding/registry-binding';
import type { TranslationKey } from '../keys';

export type TranslationSource = TranslationKey | UiParam;

export type TranslateFn = (source: TranslationSource, fallback?: string) => string;

function isUiIdentityObject(
  source: TranslationSource
): source is Extract<UiParam, { path: string }> {
  return typeof source === 'object' && source !== null && 'path' in source;
}

/**
 * Resolve any translation source (UI identity or explicit key) to a TranslationKey.
 */
export function resolveTranslationKey(source: TranslationSource): TranslationKey | null {
  if (isUiIdentityObject(source)) {
    if (isCategoryUiPath(source.path)) {
      return null;
    }
    return generateTranslationKeyFromUi(source.path) as TranslationKey;
  }

  const identity = resolveUiParam(source);
  if (identity) {
    if (isCategoryUiPath(identity.path)) {
      return null;
    }
    return generateTranslationKeyFromUi(identity.path) as TranslationKey;
  }

  if (typeof source === 'string' && validateUiIdentifierFormat(source as UiIdentifier)) {
    if (isCategoryUiPath(source as UiIdentifier)) {
      return null;
    }
    return generateTranslationKeyFromUi(source as UiIdentifier) as TranslationKey;
  }

  if (typeof source === 'string') {
    return source as TranslationKey;
  }

  return null;
}
