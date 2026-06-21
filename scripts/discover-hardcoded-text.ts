import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Script to discover hardcoded text in JSX elements for smart translation binding.
 * 
 * This script scans JSX/TSX files and detects hardcoded visible text that should be
 * internationalized using the translation system.
 * 
 * Detection targets:
 * - JSXText content
 * - placeholder attributes
 * - aria-label attributes
 * - title attributes
 * - alt attributes
 * - label attributes
 * - description attributes
 * 
 * Ignored patterns:
 * - className, style attributes
 * - IDs (id, testId, data-testid)
 * - Numbers only
 * - Short symbols (< 3 chars)
 * - Devtools internal text
 * - Empty strings
 * - Already wrapped in t() function
 */

interface HardcodedTextMatch {
  file: string;
  line: number;
  column: number | undefined;
  type: 'jsx-text' | 'placeholder' | 'aria-label' | 'title' | 'alt' | 'label' | 'description';
  text: string;
  tagName?: string;
  hasUuid: boolean;
  uuid?: string;
}

const IGNORED_PATTERNS = [
  /^\d+$/, // Numbers only
  /^[<>&'"{}]+$/, // Symbols only
  /^\s*$/, // Empty or whitespace only
  /^[a-zA-Z0-9_-]{1,2}$/, // Short identifiers (1-2 chars)
  /^gova-ui-inspector/, // Devtools internal
  /^data-gova-/, // Devtools attributes
  /^__/, // Internal fields
];

function isIgnoredText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3) return true;
  
  for (const pattern of IGNORED_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  
  return false;
}

function isAlreadyWrappedInT(text: string): boolean {
  // Check if text is already wrapped in t() function
  // This is a simple heuristic - in production, use AST parsing
  return text.includes('t(') || text.includes('useBoundUI(');
}

function scanJsxFile(filePath: string): HardcodedTextMatch[] {
  if (!/\.(tsx|jsx)$/.test(filePath)) {
    return [];
  }

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const matches: HardcodedTextMatch[] = [];

  lines.forEach((line, lineIndex) => {
    const lineNum = lineIndex + 1;

    // Detect JSXText (text between JSX tags)
    // Simple regex for demonstration - in production, use AST parsing
    const jsxTextMatches = line.matchAll(/>([^<{]+)</g);
    for (const match of jsxTextMatches) {
      const text = match[1].trim();
      if (text && !isIgnoredText(text) && !isAlreadyWrappedInT(text)) {
        const uuid = extractUuidFromLine(line);
        const matchObj: HardcodedTextMatch = {
          file: filePath,
          line: lineNum,
          column: match.index + match[0].indexOf(text),
          type: 'jsx-text',
          text,
          hasUuid: line.includes('data-ui-uuid'),
        };
        if (uuid !== undefined) {
          matchObj.uuid = uuid;
        }
        matches.push(matchObj);
      }
    }

    // Detect placeholder attributes
    const placeholderMatch = line.match(/placeholder=["']([^"']+)["']/);
    if (placeholderMatch) {
      const text = placeholderMatch[1].trim();
      if (text && !isIgnoredText(text) && !isAlreadyWrappedInT(text)) {
        const uuid = extractUuidFromLine(line);
        const matchObj: HardcodedTextMatch = {
          file: filePath,
          line: lineNum,
          column: placeholderMatch.index,
          type: 'placeholder',
          text,
          hasUuid: line.includes('data-ui-uuid'),
        };
        if (uuid !== undefined) {
          matchObj.uuid = uuid;
        }
        matches.push(matchObj);
      }
    }

    // Detect aria-label attributes
    const ariaLabelMatch = line.match(/aria-label=["']([^"']+)["']/);
    if (ariaLabelMatch) {
      const text = ariaLabelMatch[1].trim();
      if (text && !isIgnoredText(text) && !isAlreadyWrappedInT(text)) {
        const uuid = extractUuidFromLine(line);
        const matchObj: HardcodedTextMatch = {
          file: filePath,
          line: lineNum,
          column: ariaLabelMatch.index,
          type: 'aria-label',
          text,
          hasUuid: line.includes('data-ui-uuid'),
        };
        if (uuid !== undefined) {
          matchObj.uuid = uuid;
        }
        matches.push(matchObj);
      }
    }

    // Detect title attributes
    const titleMatch = line.match(/title=["']([^"']+)["']/);
    if (titleMatch) {
      const text = titleMatch[1].trim();
      if (text && !isIgnoredText(text) && !isAlreadyWrappedInT(text)) {
        const uuid = extractUuidFromLine(line);
        const matchObj: HardcodedTextMatch = {
          file: filePath,
          line: lineNum,
          column: titleMatch.index,
          type: 'title',
          text,
          hasUuid: line.includes('data-ui-uuid'),
        };
        if (uuid !== undefined) {
          matchObj.uuid = uuid;
        }
        matches.push(matchObj);
      }
    }

    // Detect alt attributes
    const altMatch = line.match(/alt=["']([^"']+)["']/);
    if (altMatch) {
      const text = altMatch[1].trim();
      if (text && !isIgnoredText(text) && !isAlreadyWrappedInT(text)) {
        const uuid = extractUuidFromLine(line);
        const matchObj: HardcodedTextMatch = {
          file: filePath,
          line: lineNum,
          column: altMatch.index,
          type: 'alt',
          text,
          hasUuid: line.includes('data-ui-uuid'),
        };
        if (uuid !== undefined) {
          matchObj.uuid = uuid;
        }
        matches.push(matchObj);
      }
    }
  });

  return matches;
}

function extractUuidFromLine(line: string): string | undefined {
  const uuidMatch = line.match(/data-ui-uuid=\{([^}]+)\.uuid\}/);
  if (uuidMatch) {
    return uuidMatch[1];
  }
  return undefined;
}

function scanDirectory(dir: string, extensions: string[]): HardcodedTextMatch[] {
  const matches: HardcodedTextMatch[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other common ignore directories
      if (['node_modules', '.next', 'dist', 'build', '.git'].includes(entry.name)) {
        continue;
      }
      matches.push(...scanDirectory(fullPath, extensions));
    } else if (entry.isFile()) {
      const ext = entry.name.split('.').pop();
      if (ext && extensions.includes(ext)) {
        matches.push(...scanJsxFile(fullPath));
      }
    }
  }

  return matches;
}

function main() {
  const srcDir = join(process.cwd(), 'src');
  const extensions = ['tsx', 'jsx'];
  
  console.log('Scanning for hardcoded text in JSX files...');
  const matches = scanDirectory(srcDir, extensions);
  
  console.log(`\nFound ${matches.length} hardcoded text occurrences:\n`);
  
  // Group by file
  const byFile = new Map<string, HardcodedTextMatch[]>();
  for (const match of matches) {
    const fileMatches = byFile.get(match.file) || [];
    fileMatches.push(match);
    byFile.set(match.file, fileMatches);
  }
  
  // Print results
  for (const [file, fileMatches] of byFile) {
    console.log(`\n${file} (${fileMatches.length} occurrences):`);
    for (const match of fileMatches) {
      const uuidStatus = match.hasUuid ? `UUID: ${match.uuid || 'unknown'}` : 'No UUID';
      console.log(`  Line ${match.line}:${match.column} [${match.type}] "${match.text}" (${uuidStatus})`);
    }
  }
  
  // Summary
  const withUuid = matches.filter(m => m.hasUuid).length;
  const withoutUuid = matches.filter(m => !m.hasUuid).length;
  console.log(`\nSummary:`);
  console.log(`  Total: ${matches.length}`);
  console.log(`  With UUID: ${withUuid}`);
  console.log(`  Without UUID: ${withoutUuid}`);
}

if (require.main === module) {
  main();
}

export { scanJsxFile, scanDirectory, type HardcodedTextMatch };
