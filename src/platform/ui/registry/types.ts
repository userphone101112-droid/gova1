/**
 * UI Registry Types
 *
 * Core type definitions for the UI Registry system.
 */

export interface UiIdentity {
  /** Immutable element UUID. Keep this value stable when moving or renaming UI paths. */
  readonly uuid: string;
  readonly id: string;
  readonly path: string;
  /** Lifecycle state for compatibility and removal governance. */
  readonly lifecycle: 'active' | 'deprecated' | 'removed';
  readonly previousIds?: readonly string[];
  readonly previousPaths?: readonly string[];
  readonly aliases?: readonly string[];
  readonly description: string;
  readonly category: 'action' | 'input' | 'navigation' | 'display' | 'container';
  readonly feature: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  /** When true, the same UUID may appear on multiple DOM nodes with data-ui-instance-id. */
  readonly repeatable?: boolean;
  /** @deprecated Use lifecycle: 'deprecated' instead. Kept for compatibility. */
  readonly deprecated?: boolean;
}

/** Overridden in registry.ts with a union of all registered paths */
export type UiIdentifier = string;
export type UiParam = UiIdentity;
