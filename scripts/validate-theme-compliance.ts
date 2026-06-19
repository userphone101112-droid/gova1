#!/usr/bin/env tsx
/**
 * Visual Design System Compliance Validator (Phase 2)
 * Fails CI when unauthorized visual values are detected outside the design system.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const SCAN_DIR = path.join(ROOT, 'src');

const ALLOWED_CSS_PATHS = [
  'src/design-system/primitive-tokens.css',
  'src/design-system/semantic-tokens.css',
  'src/design-system/visual-tokens.css',
  'src/design-system/component-tokens.css',
  'src/design-system/component-patterns.css',
];

const IGNORE_PATHS = [
  'src/platform/ui/devtools/',
];

const hexRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3,8})\b/g;
const rgbRegex = /rgba?\(\s*\d+/g;
const hslRegex = /hsla?\(\s*\d+/g;

const forbiddenTailwindColorRegex =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|decoration|outline|divide|placeholder)-(?:white|black|gray|grey|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d+)?(?:\/\d+)?\b/g;

const forbiddenCssVarRegex = /--gova-google-/g;

/** Arbitrary hardcoded dimensions in Tailwind classes */
const arbitraryDimensionRegex = /-\[(\d+(?:\.\d+)?(?:px|rem|em))\]/g;

/** Hardcoded duration/animation in CSS outside token files */
const hardcodedDurationRegex = /\b(\d+(?:\.\d+)?(?:ms|s))\b/g;

/** Out-of-scale z-index in className */
const hardcodedZIndexRegex = /\bz-\[(\d+)\]/g;

interface Violation {
  file: string;
  line: number;
  type: string;
  value: string;
  snippet: string;
}

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const IGNORE_DIRS = new Set(['node_modules', '.next', 'dist', 'coverage', 'build']);

function isIgnored(rel: string): boolean {
  return IGNORE_PATHS.some((p) => rel.includes(p));
}

function isAllowedCss(rel: string): boolean {
  return ALLOWED_CSS_PATHS.includes(rel);
}

function scanFile(filePath: string): Violation[] {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (isIgnored(rel)) return [];

  const isCss = filePath.endsWith('.css');
  const isAllowed = isCss && isAllowedCss(rel);
  const isGlobals = rel === 'src/app/globals.css';

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Colors in non-token CSS
    if (!isAllowed && (isGlobals || !isCss)) {
      for (const re of [hexRegex, rgbRegex, hslRegex]) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(line)) !== null) {
          if (re === hexRegex && /&#/.test(line.slice(Math.max(0, m.index - 1), m.index + 1))) continue;
          violations.push({ file: rel, line: lineNum, type: 'hardcoded-color', value: m[0], snippet: line.trim().slice(0, 100) });
        }
      }
    }

    // Hardcoded durations in globals.css
    if (isGlobals) {
      hardcodedDurationRegex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = hardcodedDurationRegex.exec(line)) !== null) {
        if (line.includes('var(--gova-')) continue;
        violations.push({ file: rel, line: lineNum, type: 'hardcoded-duration', value: m[0], snippet: line.trim().slice(0, 100) });
      }
    }

    if (/\.(tsx?|jsx?)$/.test(filePath)) {
      for (const [re, type] of [
        [forbiddenTailwindColorRegex, 'forbidden-tailwind-color'],
        [forbiddenCssVarRegex, 'invalid-css-variable'],
      ] as const) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(line)) !== null) {
          violations.push({ file: rel, line: lineNum, type, value: m[0], snippet: line.trim().slice(0, 100) });
        }
      }

      arbitraryDimensionRegex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = arbitraryDimensionRegex.exec(line)) !== null) {
        violations.push({ file: rel, line: lineNum, type: 'hardcoded-dimension', value: m[0], snippet: line.trim().slice(0, 100) });
      }

      hardcodedZIndexRegex.lastIndex = 0;
      while ((m = hardcodedZIndexRegex.exec(line)) !== null) {
        violations.push({ file: rel, line: lineNum, type: 'hardcoded-z-index', value: m[0], snippet: line.trim().slice(0, 100) });
      }
    }
  });

  return violations;
}

function countDefinedTokens(): number {
  let count = 0;
  for (const cssPath of ALLOWED_CSS_PATHS) {
    const full = path.join(ROOT, cssPath);
    if (!fs.existsSync(full)) continue;
    const matches = fs.readFileSync(full, 'utf-8').match(/--gova-[a-z0-9-]+:/g);
    count += matches?.length ?? 0;
  }
  return count;
}

function main(): void {
  console.log('🎨 Visual Design System Compliance Validation (Phase 2)\n');

  const files = walk(SCAN_DIR);
  const violations: Violation[] = [];
  for (const file of files) violations.push(...scanFile(file));

  const tokenCount = countDefinedTokens();
  const byType = violations.reduce<Record<string, number>>((acc, v) => {
    acc[v.type] = (acc[v.type] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Files scanned: ${files.length}`);
  console.log(`Tokens defined: ${tokenCount}`);
  console.log(`Violations: ${violations.length}\n`);

  if (violations.length > 0) {
    console.log('── Violations ──\n');
    for (const v of violations.slice(0, 50)) {
      console.log(`  [${v.type}] ${v.file}:${v.line}`);
      console.log(`    ${v.value}`);
      console.log(`    ${v.snippet}\n`);
    }
    if (violations.length > 50) console.log(`  ... and ${violations.length - 50} more\n`);
    console.log('By type:', byType);
    console.error('\n❌ Visual design compliance FAILED');
    process.exit(1);
  }

  console.log('✅ Visual design compliance PASSED — zero violations');
}

main();
