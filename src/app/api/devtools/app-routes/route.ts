import { NextResponse } from 'next/server';

import { isUiInspectorEnabled } from '@/platform/ui/devtools/inspector-access';
import { discoverAppRoutes } from '@/platform/ui/devtools/server/discover-app-routes';

function uiInspectorNotFoundResponse(): NextResponse {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/** Live App Router scan — primary source for inspector route dropdown. */
export async function GET() {
  if (!isUiInspectorEnabled()) {
    return uiInspectorNotFoundResponse();
  }

  try {
    const routes = discoverAppRoutes();
    return NextResponse.json({
      routes,
      loadedAt: new Date().toISOString(),
      source: 'app-router-scan',
    });
  } catch (error) {
    console.error('Failed to discover app routes:', error);
    return NextResponse.json({ error: 'Failed to discover routes' }, { status: 500 });
  }
}
