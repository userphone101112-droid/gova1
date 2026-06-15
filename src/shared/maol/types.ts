/**
 * MAOL — Minimal Agent Observability Layer
 * Core type definitions & normalized event schemas.
 *
 * DEV MODE:  full logging, detailed DOM summary, console warnings
 * PROD MODE: errors + warnings only, minimal DOM summary, optional sampling
 */

// ============================================================================
// ERROR EVENT
// ============================================================================

export interface MaolErrorEvent {
  type: 'error';
  message: string;
  stack?: string | undefined;
  route: string;
  timestamp: number;
  /** Stable UI Identity ID of the nearest identified ancestor, if found */
  uiContext?: string | undefined;
  /** 'dev' | 'prod' — set by collector based on NODE_ENV */
  env: 'dev' | 'prod';
}

// ============================================================================
// WARNING EVENT
// ============================================================================

export type MaolWarningSeverity = 'low' | 'medium' | 'high';

export interface MaolWarningEvent {
  type: 'warning';
  message: string;
  route: string;
  component?: string | undefined;
  severity: MaolWarningSeverity;
  timestamp: number;
  env: 'dev' | 'prod';
}

// ============================================================================
// DOM SUMMARY
// ============================================================================

export interface MaolComponentNode {
  /** Component name derived from data-ui-feature */
  name: string;
  /** All stable UI Identity IDs found inside this component */
  uiIds: string[];
  /** Element tag names (e.g., button, a, input) — no text, no classes */
  tags: string[];
}

export interface MaolDomTree {
  type: 'page';
  children: MaolComponentNode[];
}

export interface MaolDomSummary {
  route: string;
  timestamp: number;
  /** Total count of identified elements on this route */
  totalIdentified: number;
  tree: MaolDomTree;
}

// ============================================================================
// INGEST PAYLOAD (client → server)
// ============================================================================

export type MaolIngestEvent = MaolErrorEvent | MaolWarningEvent;

export interface MaolIngestPayload {
  sessionId: string;
  events?: MaolIngestEvent[];
  dom?: MaolDomSummary;
}

// ============================================================================
// AGENT RESPONSE (server → agent)
// ============================================================================

export interface MaolSessionSummary {
  totalErrors: number;
  totalWarnings: number;
  totalWarningsByseverity: Record<MaolWarningSeverity, number>;
  routesVisited: string[];
  /** ISO timestamp of first event in this session */
  sessionStart?: string | undefined;
  /** ISO timestamp of most recent event */
  lastActivity?: string | undefined;
}

export interface MaolAgentResponse {
  sessionId: string;
  errors: MaolErrorEvent[];
  warnings: MaolWarningEvent[];
  dom: MaolDomSummary[];
  summary: MaolSessionSummary;
}

// ============================================================================
// STORE RECORD (internal DB row shape)
// ============================================================================

export interface MaolStoreRecord {
  id: number;
  sessionId: string;
  payload: string; // JSON string
  createdAt: string; // ISO timestamp
}
