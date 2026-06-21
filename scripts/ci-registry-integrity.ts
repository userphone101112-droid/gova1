#!/usr/bin/env tsx
/**
 * CI check-only: generated registry artifacts must match registry sources (no writes).
 * materialize-uuids check removed since UUIDs are now optional.
 */
import { execSync } from 'child_process';

const ROOT = process.cwd();

function runCheck(command: string): void {
  execSync(command, { stdio: 'inherit', cwd: ROOT });
}

// materialize-uuids check removed - UUIDs are now optional
runCheck('npx tsx scripts/generate-registry-member-paths.ts --check');
runCheck('npx tsx src/platform/ui/enforcement/scripts/audit-unified-ui-i18n.ts --check-source-index');

console.log('✅ ci:registry-integrity passed');
