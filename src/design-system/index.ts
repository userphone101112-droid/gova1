/**
 * Design System — Single Source of Truth (SSOT)
 *
 * All visual tokens originate from CSS token files:
 *   primitive-tokens.css → semantic-tokens.css → component-tokens.css → globals.css (@theme)
 *
 * Import from this module only. Do not define visual values elsewhere.
 */

export {
  getDesignToken,
  isDesignToken,
  type DesignSystemTokens,
  type PrimitiveColorTokens,
  type PrimitiveTypographyTokens,
  type SemanticColorTokens,
} from './tokens';

export { GOVA_TOKENS, type GovaTokenName, cssVar } from './token-names';

/** Canonical CSS cascade entry points */
export const DESIGN_SYSTEM_CSS_LAYERS = [
  '@/design-system/primitive-tokens.css',
  '@/design-system/semantic-tokens.css',
  '@/design-system/visual-tokens.css',
  '@/design-system/component-tokens.css',
  '@/design-system/component-patterns.css',
] as const;
