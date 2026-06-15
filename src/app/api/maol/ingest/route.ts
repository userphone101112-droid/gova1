/**
 * MAOL — Ingest Endpoint
 * POST /api/maol/ingest
 *
 * Receives events from the browser client (errors, warnings, DOM summaries).
 * Validates payload structure before writing to the store.
 * Always returns { ok: true } — never blocks the client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isValidMaolSessionId } from '@/shared/maol/session';
import { storeError, storeWarning, storeDomSummary } from '@/lib/maol-store';
import type {
  MaolIngestPayload,
  MaolErrorEvent,
  MaolWarningEvent,
  MaolDomSummary,
} from '@/shared/maol/types';

const OK = NextResponse.json({ ok: true }, { status: 200 });
const IGNORED = NextResponse.json({ ok: true, note: 'ignored' }, { status: 200 });

// Env var check — MAOL must be explicitly enabled
function isMaolEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MAOL_ENABLED === 'true';
}

function isValidErrorEvent(e: unknown): e is MaolErrorEvent {
  if (!e || typeof e !== 'object') return false;
  const ev = e as Record<string, unknown>;
  return (
    ev.type === 'error' &&
    typeof ev.message === 'string' &&
    typeof ev.route === 'string' &&
    typeof ev.timestamp === 'number'
  );
}

function isValidWarningEvent(e: unknown): e is MaolWarningEvent {
  if (!e || typeof e !== 'object') return false;
  const ev = e as Record<string, unknown>;
  return (
    ev.type === 'warning' &&
    typeof ev.message === 'string' &&
    typeof ev.route === 'string' &&
    typeof ev.timestamp === 'number' &&
    ['low', 'medium', 'high'].includes(ev.severity as string)
  );
}

function isValidDomSummary(d: unknown): d is MaolDomSummary {
  if (!d || typeof d !== 'object') return false;
  const ds = d as Record<string, unknown>;
  return (
    typeof ds.route === 'string' &&
    typeof ds.timestamp === 'number' &&
    typeof ds.tree === 'object' &&
    ds.tree !== null
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isMaolEnabled()) return IGNORED;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return OK; // Malformed body — silently ignore, never block client
  }

  const payload = body as Partial<MaolIngestPayload>;

  const sessionId = payload?.sessionId;
  if (!sessionId || !isValidMaolSessionId(sessionId)) {
    return OK; // Invalid session — silently ignore
  }

  // Process events array
  const events = Array.isArray(payload.events) ? payload.events : [];
  for (const event of events) {
    try {
      if (isValidErrorEvent(event)) {
        // Sanitize: cap message and stack length
        storeError(sessionId, {
          ...event,
          message: event.message.substring(0, 1000),
          stack: event.stack?.substring(0, 3000),
        });
      } else if (isValidWarningEvent(event)) {
        storeWarning(sessionId, {
          ...event,
          message: event.message.substring(0, 500),
        });
      }
    } catch {
      // Per-event errors are isolated — continue processing
    }
  }

  // Process DOM summary (optional, separate field)
  if (payload.dom && isValidDomSummary(payload.dom)) {
    try {
      storeDomSummary(sessionId, payload.dom);
    } catch {
      // Isolated — does not affect event processing
    }
  }

  return OK;
}

// Reject all other methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
