import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

interface LegacyViolation {
  id: string;
  type: 'hardcoded_text' | 'missing_ui_identifier' | 'missing_translation' | 'missing_binding';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  file: string;
  line: number;
  column: number;
  feature: string;
  description: string;
  suggestion: string;
  autoFixable: boolean;
}

interface LegacyViolationReport {
  scanDate: string;
  totalViolations: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byFeature: Record<string, number>;
  violations: LegacyViolation[];
}

function scanLegacyViolations(): LegacyViolationReport {
  console.log('🔍 Starting Legacy Violation Scan...\n');
  
  const violations: LegacyViolation[] = [];
  const srcPath = join(process.cwd(), 'src');
  
  // Scan all TypeScript and TSX files
  scanDirectory(srcPath, violations);
  
  // Group violations
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byFeature: Record<string, number> = {};
  
  for (const violation of violations) {
    byType[violation.type] = (byType[violation.type] || 0) + 1;
    bySeverity[violation.severity] = (bySeverity[violation.severity] || 0) + 1;
    byFeature[violation.feature] = (byFeature[violation.feature] || 0) + 1;
  }
  
  const report: LegacyViolationReport = {
    scanDate: new Date().toISOString(),
    totalViolations: violations.length,
    byType,
    bySeverity,
    byFeature,
    violations,
  };
  
  console.log(`\n📊 Scan Complete:`);
  console.log(`   Total Violations: ${violations.length}`);
  console.log(`   By Type: ${JSON.stringify(byType, null, 2)}`);
  console.log(`   By Severity: ${JSON.stringify(bySeverity, null, 2)}`);
  console.log(`   By Feature: ${JSON.stringify(byFeature, null, 2)}`);
  
  return report;
}

function scanDirectory(dirPath: string, violations: LegacyViolation[]): void {
  if (!existsSync(dirPath)) {
    return;
  }
  
  const items = readdirSync(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Skip node_modules and other common exclusions
      if (item.name === 'node_modules' || item.name === '.next' || item.name === 'build') {
        continue;
      }
      scanDirectory(fullPath, violations);
    } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
      scanFile(fullPath, violations);
    }
  }
}

function scanFile(filePath: string, violations: LegacyViolation[]): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract feature from file path
    const feature = extractFeatureFromPath(filePath);
    
    // Scan for hardcoded text in JSX
    scanForHardcodedText(filePath, lines, feature, violations);
    
    // Scan for missing UI identifiers (native HTML elements)
    scanForMissingUiIdentifiers(filePath, lines, feature, violations);
    
    // Scan for missing translation usage
    scanForMissingTranslations(filePath, lines, feature, violations);
    
    // Scan for UI identifiers without binding
    scanForMissingBindings(filePath, lines, feature, violations);
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
  }
}

function extractFeatureFromPath(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  const featuresIndex = parts.indexOf('features');
  
  if (featuresIndex !== -1 && featuresIndex + 1 < parts.length) {
    return parts[featuresIndex + 1];
  }
  
  // Default to 'common' if not in features folder
  return 'common';
}

function scanForHardcodedText(
  filePath: string,
  lines: string[],
  feature: string,
  violations: LegacyViolation[]
): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Look for JSX text content that's not in expressions
    // Pattern: >Text< where Text is not a number or single character
    const jsxTextPattern = />\s*([A-Z][^<{]+)\s*</g;
    let match;
    
    while ((match = jsxTextPattern.exec(line)) !== null) {
      const text = match[1].trim();
      
      // Skip if it's too short or looks like code
      if (text.length < 2 || /^[A-Z_\-0-9]+$/.test(text)) {
        continue;
      }
      
      // Skip if it's in a comment
      if (line.includes('//') || line.includes('/*')) {
        continue;
      }
      
      violations.push({
        id: generateViolationId('hardcoded_text', filePath, lineNum, match.index),
        type: 'hardcoded_text',
        severity: 'HIGH',
        file: filePath,
        line: lineNum,
        column: match.index + 1,
        feature,
        description: `Hardcoded text "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" found in JSX`,
        suggestion: `Replace with translation: {t("${feature}.key")}`,
        autoFixable: true,
      });
    }
  }
}

function scanForMissingUiIdentifiers(
  filePath: string,
  lines: string[],
  feature: string,
  violations: LegacyViolation[]
): void {
  const nativeInteractiveElements = ['button', 'input', 'select', 'textarea', 'a', 'form'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    for (const element of nativeInteractiveElements) {
      // Look for native element usage
      const pattern = new RegExp(`<${element}(\\s|>)`, 'g');
      let match;
      
      while ((match = pattern.exec(line)) !== null) {
        // Skip if it's a comment or string
        if (line.includes('//') || line.includes('/*') || line.includes('"') || line.includes("'")) {
          continue;
        }
        
        violations.push({
          id: generateViolationId('missing_ui_identifier', filePath, lineNum, match.index),
          type: 'missing_ui_identifier',
          severity: 'CRITICAL',
          file: filePath,
          line: lineNum,
          column: match.index + 1,
          feature,
          description: `Native <${element}> element used instead of Ui component`,
          suggestion: `Replace with Ui${element.charAt(0).toUpperCase() + element.slice(1)} component with ui prop`,
          autoFixable: true,
        });
      }
    }
  }
}

function scanForMissingTranslations(
  filePath: string,
  lines: string[],
  feature: string,
  violations: LegacyViolation[]
): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Look for text content that should be translated
    // Pattern: strings in JSX that are not attributes or expressions
    const textPattern = />([^<{]+)</g;
    let match;
    
    while ((match = textPattern.exec(line)) !== null) {
      const text = match[1].trim();
      
      // Skip if it's empty, too short, or looks like code
      if (!text || text.length < 2 || /^[A-Z_\-0-9]+$/.test(text)) {
        continue;
      }
      
      // Skip if it's already wrapped in t()
      if (line.includes('t(') || line.includes('t("')) {
        continue;
      }
      
      // Skip if it's in a comment
      if (line.includes('//') || line.includes('/*')) {
        continue;
      }
      
      // Skip if it's an attribute value
      if (line.includes('=') && line.match(/=\s*["']/)) {
        continue;
      }
      
      violations.push({
        id: generateViolationId('missing_translation', filePath, lineNum, match.index),
        type: 'missing_translation',
        severity: 'HIGH',
        file: filePath,
        line: lineNum,
        column: match.index + 1,
        feature,
        description: `Text "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" not wrapped in translation function`,
        suggestion: `Wrap in translation: {t("${feature}.key")}`,
        autoFixable: true,
      });
    }
  }
}

function scanForMissingBindings(
  filePath: string,
  lines: string[],
  feature: string,
  violations: LegacyViolation[]
): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Look for UI identifier usage
    const uiPattern = /ui=\{([^}]+)\}/g;
    let match;
    
    while ((match = uiPattern.exec(line)) !== null) {
      const uiValue = match[1].trim();
      
      // Extract string literals
      const stringMatches = uiValue.match(/'([^']+)'/g);
      if (stringMatches) {
        for (const str of stringMatches) {
          const identifier = str.replace(/'/g, '');
          
          if (identifier.includes('.')) {
            // Check if this UI identifier has a corresponding translation
            // This is a simplified check - in reality, we'd need to load the translation registry
            const parts = identifier.split('.');
            if (parts.length >= 4) {
              const expectedKey = `${parts[0]}.${parts[1]}.${parts[3].replace(/-/g, '')}`;
              
              // For now, we'll flag all UI identifiers for manual review
              violations.push({
                id: generateViolationId('missing_binding', filePath, lineNum, match.index),
                type: 'missing_binding',
                severity: 'MEDIUM',
                file: filePath,
                line: lineNum,
                column: match.index + 1,
                feature,
                description: `UI identifier "${identifier}" may be missing translation binding`,
                suggestion: `Ensure translation key "${expectedKey}" exists in i18n files`,
                autoFixable: false,
              });
            }
          }
        }
      }
    }
  }
}

function generateViolationId(type: string, file: string, line: number, column: number): string {
  const fileHash = file.split(/[/\\]/).pop() || 'unknown';
  return `${type}_${fileHash}_${line}_${column}`;
}

function generateJsonReport(report: LegacyViolationReport): void {
  const outputPath = join(process.cwd(), 'docs', 'migration', 'legacy-violations-report.json');
  const fs = require('fs');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n📄 JSON report generated: ${outputPath}`);
}

function generateHumanReport(report: LegacyViolationReport): void {
  const reportContent = `# Legacy Violations Report

**Generated:** ${report.scanDate}
**Total Violations:** ${report.totalViolations}

## Executive Summary

- **CRITICAL:** ${report.bySeverity.CRITICAL || 0}
- **HIGH:** ${report.bySeverity.HIGH || 0}
- **MEDIUM:** ${report.bySeverity.MEDIUM || 0}
- **LOW:** ${report.bySeverity.LOW || 0}

## Violations by Type

${Object.entries(report.byType).map(([type, count]) => `- **${type}:** ${count}`).join('\n')}

## Violations by Feature

${Object.entries(report.byFeature).map(([feature, count]) => `- **${feature}:** ${count}`).join('\n')}

## Detailed Violations

${report.violations.map(v => `
### ${v.id}

- **Type:** ${v.type}
- **Severity:** ${v.severity}
- **File:** ${v.file}
- **Line:** ${v.line}
- **Column:** ${v.column}
- **Feature:** ${v.feature}
- **Description:** ${v.description}
- **Suggestion:** ${v.suggestion}
- **Auto-Fixable:** ${v.autoFixable ? 'Yes' : 'No'}
`).join('\n---\n')}

## Migration Priority

1. **CRITICAL** - Fix immediately (breaks UI/i18n rules)
2. **HIGH** - Fix soon (hardcoded text)
3. **MEDIUM** - Fix during migration (missing binding)
4. **LOW** - Fix later (style/legacy patterns)

## Next Steps

1. Run automated fixer for auto-fixable violations
2. Manually review and fix remaining violations
3. Validate fixes with ESLint and TypeScript
4. Run clean state validation
`;

  const outputPath = join(process.cwd(), 'docs', 'migration', 'legacy-violations.md');
  const fs = require('fs');
  fs.writeFileSync(outputPath, reportContent, 'utf-8');
  console.log(`📄 Human report generated: ${outputPath}`);
}

function main() {
  console.log('🚀 Starting Legacy Violation Scanner...\n');
  
  try {
    const report = scanLegacyViolations();
    generateJsonReport(report);
    generateHumanReport(report);
    
    console.log(`\n✨ Legacy violation scan complete!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Review the reports in docs/migration/`);
    console.log(`   2. Run automated fixer: npm run fix-legacy-violations`);
    console.log(`   3. Manually fix remaining violations`);
    console.log(`   4. Validate clean state: npm run validate-clean-state`);
  } catch (error) {
    console.error('Legacy violation scan failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as scanLegacyViolations };
