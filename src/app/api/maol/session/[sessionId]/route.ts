/**
 * MAOL — Agent Query Endpoint
 * GET /api/maol/session/[sessionId]
 *
 * Returns full structured observability data for a given session.
 * Protected by MAOL_SECRET token (Authorization: Bearer <token>).
 *
 * Response shape:
 * {
 *   sessionId: string,
 *   errors: MaolErrorEvent[],
 *   warnings: MaolWarningEvent[],
 *   dom: MaolDomSummary[],
 *   summary: MaolSessionSummary
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { isValidMaolSessionId } from '@/shared/maol/session';
import { getSessionData } from '@/lib/maol-store';

// ---------------------------------------------------------------------------
// Authentication helpers
// ---------------------------------------------------------------------------

function isMaolEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MAOL_ENABLED === 'true';
}

/**
 * Validate the Bearer token from the Authorization header.
 * Requires MAOL_SECRET env var to be set on the server.
 * Also accepts x-maol-token header as an alternative.
 */
function isAuthorized(request: NextRequest): boolean {
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

  // 2. Authentication
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
