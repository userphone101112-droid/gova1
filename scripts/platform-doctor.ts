#!/usr/bin/env tsx
/**
 * Platform doctor — quick health check for UI platform + i18n.
 */
import { execSync } from 'child_process';

const checks = [
  { name: 'TypeScript', cmd: 'npm run typecheck' },
  { name: 'i18n CI', cmd: 'npm run ci:i18n' },
  { name: 'UI+i18n Audit', cmd: 'npm run audit:unified-ui-i18n' },
  { name: 'Orphan Audit', cmd: 'npm run audit:orphans' },
];

let failed = 0;

console.log('🏥 Platform Doctor\n');

for (const check of checks) {
  process.stdout.write(`→ ${check.name}... `);
  try {
    execSync(check.cmd, { stdio: 'pipe' });
    console.log('✓');
  } catch (error) {
    failed += 1;
    console.log('✗');
    const err = error as { stdout?: Buffer; stderr?: Buffer };
    const output = [err.stdout?.toString(), err.stderr?.toString()].filter(Boolean).join('\n');
    if (output) {
      console.log(output.slice(0, 2000));
    }
  }
}

console.log(failed === 0 ? '\n✅ Platform healthy' : `\n⚠️  ${failed} check(s) failed`);
process.exit(failed === 0 ? 0 : 1);
