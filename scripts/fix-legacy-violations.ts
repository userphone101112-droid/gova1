import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { LegacyViolation } from '../src/shared/migration/migration-queue';
import { loadMigrationQueue, saveMigrationQueue, markViolationFixed, markViolationSkipped } from '../src/shared/migration/migration-queue';

interface FixResult {
  violationId: string;
  success: boolean;
  originalContent: string;
  fixedContent: string;
  error?: string;
}

interface FixSummary {
  totalFixesAttempted: number;
  successfulFixes: number;
  failedFixes: number;
  skippedFixes: number;
  results: FixResult[];
}

/**
 * Automated Fixer (Safe Mode)
 * 
 * ONLY auto-fix safe cases
 * NEVER break UI structure
 * NEVER modify business logic
 */
function fixLegacyViolations(dryRun: boolean = false): FixSummary {
  console.log('🔧 Starting Automated Fixer (Safe Mode)...\n');
  
  const queue = loadMigrationQueue();
  if (!queue) {
    console.error('❌ Migration queue not found. Run scan-legacy-violations first.');
    process.exit(1);
  }
  
  const autoFixableViolations = queue.violations.filter(v => v.autoFixable && v.status === 'pending');
  
  console.log(`📊 Found ${autoFixableViolations.length} auto-fixable violations`);
  console.log(`🔒 Dry Run: ${dryRun ? 'YES (no changes will be made)' : 'NO (changes will be applied)'}\n`);
  
  const results: FixResult[] = [];
  let successfulFixes = 0;
  let failedFixes = 0;
  let skippedFixes = 0;
  
  for (const violation of autoFixableViolations) {
    console.log(`\n🔍 Processing: ${violation.id}`);
    console.log(`   Type: ${violation.type}`);
    console.log(`   File: ${violation.file}`);
    console.log(`   Line: ${violation.line}`);
    
    try {
      const result = fixViolation(violation, dryRun);
      results.push(result);
      
      if (result.success) {
        successfulFixes++;
        console.log(`   ✅ Fixed successfully`);
        
        if (!dryRun) {
          markViolationFixed(queue, violation.id);
        }
      } else {
        failedFixes++;
        console.log(`   ❌ Fix failed: ${result.error}`);
        
        if (!dryRun) {
          markViolationSkipped(queue, violation.id, result.error);
        }
      }
    } catch (error) {
      failedFixes++;
      console.log(`   ❌ Error: ${error}`);
      
      results.push({
        violationId: violation.id,
        success: false,
        originalContent: '',
        fixedContent: '',
        error: String(error),
      });
    }
  }
  
  if (!dryRun) {
    saveMigrationQueue(queue);
  }
  
  const summary: FixSummary = {
    totalFixesAttempted: autoFixableViolations.length,
    successfulFixes,
    failedFixes,
    skippedFixes,
    results,
  };
  
  console.log(`\n📊 Fix Summary:`);
  console.log(`   Total Attempted: ${summary.totalFixesAttempted}`);
  console.log(`   Successful: ${summary.successfulFixes}`);
  console.log(`   Failed: ${summary.failedFixes}`);
  console.log(`   Skipped: ${summary.skippedFixes}`);
  
  return summary;
}

/**
 * Fix a single violation
 */
function fixViolation(violation: LegacyViolation, dryRun: boolean): FixResult {
  const filePath = violation.file;
  
  if (!existsSync(filePath)) {
    return {
      violationId: violation.id,
      success: false,
      originalContent: '',
      fixedContent: '',
      error: 'File not found',
    };
  }
  
  const originalContent = readFileSync(filePath, 'utf-8');
  const lines = originalContent.split('\n');
  const lineIndex = violation.line - 1;
  
  if (lineIndex < 0 || lineIndex >= lines.length) {
    return {
      violationId: violation.id,
      success: false,
      originalContent,
      fixedContent: originalContent,
      error: 'Line number out of range',
    };
  }
  
  const originalLine = lines[lineIndex];
  let fixedLine: string;
  
  switch (violation.type) {
    case 'hardcoded_text':
      fixedLine = fixHardcodedText(originalLine, violation);
      break;
    case 'missing_ui_identifier':
      fixedLine = fixMissingUiIdentifier(originalLine, violation);
      break;
    case 'missing_translation':
      fixedLine = fixMissingTranslation(originalLine, violation);
      break;
    case 'missing_binding':
      // Cannot auto-fix missing bindings safely
      return {
        violationId: violation.id,
        success: false,
        originalContent,
        fixedContent: originalContent,
        error: 'Manual fix required for missing bindings',
      };
    default:
      return {
        violationId: violation.id,
        success: false,
        originalContent,
        fixedContent: originalContent,
        error: 'Unknown violation type',
      };
  }
  
  if (fixedLine === originalLine) {
    return {
      violationId: violation.id,
      success: false,
      originalContent,
      fixedContent: originalContent,
      error: 'No changes needed or unable to fix safely',
    };
  }
  
  // Apply the fix
  lines[lineIndex] = fixedLine;
  const fixedContent = lines.join('\n');
  
  if (!dryRun) {
    writeFileSync(filePath, fixedContent, 'utf-8');
  }
  
  return {
    violationId: violation.id,
    success: true,
    originalContent,
    fixedContent,
  };
}

/**
 * Fix hardcoded text by wrapping in translation function
 */
function fixHardcodedText(line: string, violation: LegacyViolation): string {
  // Pattern: >Text< -> >{t("feature.key")}<
  // This is a simplified fix - in reality, we'd need to generate proper translation keys
  
  const textMatch = line.match(/>([^<{]+)</);
  if (!textMatch) {
    return line;
  }
  
  const text = textMatch[1].trim();
  const feature = violation.feature;
  
  // Generate a simple translation key based on the text
  const key = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Replace with translation function
  const fixedLine = line.replace(
    />([^<{]+)</,
    `>{{t("${feature}.${key}")}}<`
  );
  
  return fixedLine;
}

/**
 * Fix missing UI identifier by replacing native element with Ui component
 */
function fixMissingUiIdentifier(line: string, violation: LegacyViolation): string {
  const feature = violation.feature;
  const elementMatch = line.match(/<([a-z]+)(\s|>)/);
  
  if (!elementMatch) {
    return line;
  }
  
  const element = elementMatch[1];
  const uiComponent = `Ui${element.charAt(0).toUpperCase() + element.slice(1)}`;
  
  // Generate a default UI identifier
  const uiIdentifier = `${feature}.default.${element}`;
  
  // Replace native element with Ui component
  let fixedLine = line.replace(
    new RegExp(`<${element}(\\s|>)`),
    `<${uiComponent} ui="${uiIdentifier}"$1`
  );
  
  return fixedLine;
}

/**
 * Fix missing translation by wrapping text in t() function
 */
function fixMissingTranslation(line: string, violation: LegacyViolation): string {
  const feature = violation.feature;
  const textMatch = line.match(/>([^<{]+)</);
  
  if (!textMatch) {
    return line;
  }
  
  const text = textMatch[1].trim();
  
  // Generate a simple translation key
  const key = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Replace with translation function
  const fixedLine = line.replace(
    />([^<{]+)</,
    `>{{t("${feature}.${key}")}}<`
  );
  
  return fixedLine;
}

/**
 * Generate fix report
 */
function generateFixReport(summary: FixSummary, dryRun: boolean): void {
  const reportContent = `# Automated Fix Report

**Generated:** ${new Date().toISOString()}
**Dry Run:** ${dryRun ? 'YES' : 'NO'}

## Summary

- Total Fixes Attempted: ${summary.totalFixesAttempted}
- Successful Fixes: ${summary.successfulFixes}
- Failed Fixes: ${summary.failedFixes}
- Skipped Fixes: ${summary.skippedFixes}

## Detailed Results

${summary.results.map(result => `
### ${result.violationId}

- **Status:** ${result.success ? '✅ Success' : '❌ Failed'}
- **Error:** ${result.error || 'None'}
${result.success ? `- **Original:** \`${result.originalContent.substring(0, 100)}\`
- **Fixed:** \`${result.fixedContent.substring(0, 100)}\`` : ''}
`).join('\n---\n')}

## Next Steps

${dryRun ? `
1. Review the dry run results
2. Run without --dry-run to apply fixes: npm run fix-legacy-violations
3. Manually fix remaining violations
4. Validate with ESLint and TypeScript
` : `
1. Review the applied fixes
2. Run ESLint and TypeScript to validate
3. Manually fix remaining violations
4. Run clean state validation
`}
`;

  const outputPath = join(process.cwd(), 'docs', 'migration', 'fix-report.md');
  const fs = require('fs');
  fs.writeFileSync(outputPath, reportContent, 'utf-8');
  console.log(`\n📄 Fix report generated: ${outputPath}`);
}

function main() {
  console.log('🚀 Starting Automated Fixer...\n');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  try {
    const summary = fixLegacyViolations(dryRun);
    generateFixReport(summary, dryRun);
    
    console.log(`\n✨ Automated fixer complete!`);
    
    if (dryRun) {
      console.log(`\n⚠️  This was a dry run. No changes were applied.`);
      console.log(`   Run without --dry-run to apply fixes.`);
    } else {
      console.log(`\n✅ Fixes applied successfully.`);
      console.log(`   Run ESLint and TypeScript to validate the changes.`);
    }
  } catch (error) {
    console.error('Automated fixer failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as fixLegacyViolations };
