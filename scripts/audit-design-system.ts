#!/usr/bin/env tsx
/**
 * Design System Audit Script
 * Scans the codebase for hardcoded design values and reports violations.
 */

import * as fs from "fs";
import * as path from "path";

// Regex patterns
const hexColorRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
const rgbColorRegex = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+\s*)?\)/g;
const hslColorRegex = /hsla?\s*\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?(?:\s*,\s*[\d.]+\s*)?\)/g;
const hardcodedSpacingRegex = /\b(\d+(?:\.\d+)?)(?:px|rem|em)\b/g;
const allowedFiles = [
  ".css",
  ".tsx",
  ".ts",
  ".jsx",
  ".js",
];
const ignorePatterns = [
  "node_modules",
  ".next",
  "dist",
  "coverage",
  "out",
  "build",
  "graphify-out",
];

// Violation types
type ViolationType = "color" | "spacing" | "border-radius" | "shadow";

interface Violation {
  file: string;
  line: number;
  column: number;
  type: ViolationType;
  value: string;
  snippet: string;
}

interface AuditReport {
  filesScanned: number;
  violations: Violation[];
  tokenCoverage: {
    totalTokens: number;
    usedTokens: number;
    coveragePercentage: number;
  };
  compliancePercentage: number;
}

// Main function
async function main() {
  console.log("🔍 Starting Design System Audit...\n");
  const startTime = Date.now();

  const rootDir = process.cwd();
  const violations: Violation[] = [];
  let filesScanned = 0;

  // Walk through all files
  function walkDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Check if we should ignore this path
      if (ignorePatterns.some(pattern => fullPath.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        walkDirectory(fullPath);
      } else if (entry.isFile() && allowedFiles.some(ext => entry.name.endsWith(ext))) {
        filesScanned++;
        const fileViolations = scanFile(fullPath);
        violations.push(...fileViolations);
      }
    }
  }

  // Scan a single file
  function scanFile(filePath: string): Violation[] {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const fileViolations: Violation[] = [];

    lines.forEach((line, lineIndex) => {
      // Check colors
      const matches = [
        ...line.matchAll(hexColorRegex),
        ...line.matchAll(rgbColorRegex),
        ...line.matchAll(hslColorRegex),
      ];

      for (const match of matches) {
        if (match.index !== undefined) {
          fileViolations.push({
            file: path.relative(rootDir, filePath),
            line: lineIndex + 1,
            column: match.index + 1,
            type: "color",
            value: match[0],
            snippet: line.trim().slice(0, 80),
          });
        }
      }

      // Check spacing
      const spacingMatches = line.matchAll(hardcodedSpacingRegex);
      for (const match of spacingMatches) {
        if (match.index !== undefined) {
          fileViolations.push({
            file: path.relative(rootDir, filePath),
            line: lineIndex + 1,
            column: match.index + 1,
            type: "spacing",
            value: match[0],
            snippet: line.trim().slice(0, 80),
          });
        }
      }
    });

    return fileViolations;
  }

  walkDirectory(rootDir);

  // Calculate report stats
  const totalViolations = violations.length;
  const report: AuditReport = {
    filesScanned,
    violations,
    tokenCoverage: {
      totalTokens: 100, // Estimate for now
      usedTokens: 0,
      coveragePercentage: 0,
    },
    compliancePercentage: 100 - Math.min((totalViolations / (filesScanned * 10)) * 100, 100),
  };

  // Generate report file
  const reportPath = path.join(rootDir, "docs", "audits", "design-system-audit.md");
  let reportContent = `# Design System Audit Report\n\n`;
  reportContent += `Date: ${new Date().toISOString()}\n\n`;
  reportContent += `## Summary\n\n`;
  reportContent += `- Files Scanned: ${report.filesScanned}\n`;
  reportContent += `- Violations Found: ${report.violations.length}\n`;
  reportContent += `- Compliance Percentage: ${report.compliancePercentage.toFixed(1)}%\n\n`;

  if (report.violations.length > 0) {
    reportContent += `## Violations\n\n`;
    for (const violation of report.violations.slice(0, 100)) {
      reportContent += `### ${violation.file}:${violation.line}\n`;
      reportContent += `- Type: ${violation.type}\n`;
      reportContent += `- Value: \`${violation.value}\`\n`;
      reportContent += `- Snippet: \`${violation.snippet}\`\n\n`;
    }
    if (report.violations.length > 100) {
      reportContent += `... and ${report.violations.length - 100} more violations\n\n`;
    }
  }

  // Write report
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportContent);

  // Print summary
  console.log("✅ Audit Complete!\n");
  console.log(`📊 Summary:`);
  console.log(`   Files Scanned: ${report.filesScanned}`);
  console.log(`   Violations Found: ${report.violations.length}`);
  console.log(`   Compliance Percentage: ${report.compliancePercentage.toFixed(1)}%`);
  console.log(`\n📝 Full report: ${reportPath}`);
  console.log(`⏱️  Time taken: ${Date.now() - startTime}ms`);
}

main().catch(console.error);
