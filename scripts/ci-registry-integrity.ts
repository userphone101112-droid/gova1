#!/usr/bin/env tsx
/**
 * CI check-only: generated registry artifacts must match registry sources (no writes).
 */
import { execSync } from 'child_process';

const ROOT = process.cwd();

function runCheck(command: string): void {
  execSync(command, { stdio: 'inherit', cwd: ROOT });
}

runCheck('npm run registry:materialize-uuids -- --check');
runCheck('npx tsx scripts/generate-registry-member-paths.ts --check');
runCheck('npx tsx src/platform/ui/enforcement/scripts/audit-unified-ui-i18n.ts --check-source-index');

console.log('✅ ci:registry-integrity passed');
