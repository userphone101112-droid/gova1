/**
 * MAOL — Agent Query Endpoint
 * GET /api/maol/session/[sessionId]
 *
 * Returns full structured observability data for a given session.
 *
 * 🔓 DEVELOPMENT MODE: NO AUTH REQUIRED! Just call it directly!
 * 🔒 PRODUCTION MODE: Requires MAOL_SECRET token (Authorization: Bearer <token>)
 *
 * Response shape:
 * {
 *   sessionId: string,
 *   errors: MaolErrorEvent[],
 *   warnings: MaolWarningEvent[],
 *   dom: MaolDomSummary[],
 *   summary: MaolSessionSummary
 * }
 *
 * @see docs/SERVER_ARCHITECTURE.md for complete documentation
 */

import { NextRequest, NextResponse } from 'next/server';

import { getSessionData } from '@/lib/maol-store';
import { isValidMaolSessionId } from '@/shared/maol/session';

// ---------------------------------------------------------------------------
// Authentication helpers
// ---------------------------------------------------------------------------

/**
 * MAOL IS ALWAYS ENABLED IN DEVELOPMENT MODE!
 * Only check flag in production.
 */
function isMaolEnabled(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  return process.env.NEXT_PUBLIC_MAOL_ENABLED === 'true';
}

/**
 * Validate the Bearer token from the Authorization header.
 *
 * 🔓 In DEV MODE: always returns true! No auth required!
 * 🔒 In PRODUCTION MODE: Requires MAOL_SECRET env var
 *
 * Also accepts x-maol-token header as an alternative.
 */
function isAuthorized(request: NextRequest): boolean {
  // Skip auth in dev mode
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const secret = process.env.MAOL_SECRET;

  // If no secret is configured, endpoint is disabled entirely
  if (!secret || secret.trim() === '') return false;

  // Check Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const [scheme, token] = authHeader.split(' ');
    if (scheme === 'Bearer' && token === secret) return true;
  }

  // Check x-maol-token header (alternative)
  const tokenHeader = request.headers.get('x-maol-token');
  if (tokenHeader === secret) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<NextResponse> {
  // 1. Feature flag check
  if (!isMaolEnabled()) {
    return NextResponse.json(
      { error: 'MAOL is not enabled on this server.' },
      { status: 403 }
    );
  }

  // 2. Authentication (skipped in dev mode!)
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide a valid MAOL_SECRET token.' },
      { status: 401 }
    );
  }

  // 3. Session ID validation
  const { sessionId } = await params;
  if (!sessionId || !isValidMaolSessionId(sessionId)) {
    return NextResponse.json(
      { error: 'Invalid session ID format. Expected: maol_<alphanumeric>' },
      { status: 400 }
    );
  }

  // 4. Retrieve session data
  const data = getSessionData(sessionId);

  if (!data) {
    return NextResponse.json(
      {
        sessionId,
        errors: [],
        warnings: [],
        dom: [],
        summary: {
          totalErrors: 0,
          totalWarnings: 0,
          totalWarningsByseverity: { low: 0, medium: 0, high: 0 },
          routesVisited: [],
        },
      },
      { status: 200 }
    );
  }

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache',
      'X-Maol-Session': sessionId,
    },
  });
}

// Reject all other methods
export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
