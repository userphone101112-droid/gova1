/**
 * UI Registry Types
 * 
 * Core type definitions for the UI Registry system.
 */

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

export type UiIdentifier = string;
export type UiParam = UiIdentifier | UiIdentity;
