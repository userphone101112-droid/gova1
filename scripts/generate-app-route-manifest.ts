#!/usr/bin/env tsx
/**
 * Scan src/app for page.tsx files and emit app-route-manifest.json for UI Inspector.
 */
import { writeFileSync } from 'fs';
import { join } from 'path';

import { discoverAppRoutes } from '../src/platform/ui/devtools/server/discover-app-routes';

const ROOT = process.cwd();
const OUTPUT = join(ROOT, 'src', 'platform', 'ui', 'devtools', 'app-route-manifest.json');

function main() {
  const routes = discoverAppRoutes();
  const manifest = {
    generatedAt: new Date().toISOString(),
    routes,
  };

  writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  console.log(`✅ Generated ${routes.length} app routes → ${OUTPUT.replace(ROOT, '.')}`);
}

main();
