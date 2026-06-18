#!/usr/bin/env tsx
/**
 * Regenerate registry source-index.ts from component usage scan.
 */
import { execSync } from 'child_process';

console.log('📦 Generating registry source index...\n');
execSync('npm run audit:unified-ui-i18n', { stdio: 'inherit' });
console.log('\n✅ Registry source index updated');
