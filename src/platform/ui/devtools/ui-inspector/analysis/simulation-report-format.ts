import type { SimulationInsightsReport } from './simulation-analysis';

export function formatSimulationReportMarkdown(report: SimulationInsightsReport): string {
  const lines: string[] = [
    '# UI Inspector Simulation Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    `- Saved elements: ${report.savedElements}`,
    `- Linked elements: ${report.linkedElements}`,
    `- Unbound elements: ${report.unboundElements}`,
    `- Total bindings: ${report.totalBindings}`,
    '',
    '## Database Usage',
    ...report.columnUsage.slice(0, 20).map((u) => `- ${u.label}: ${u.count}`),
    '',
    '## Storage Usage',
    ...report.storageSubUsage.slice(0, 20).map((u) => `- ${u.label}: ${u.count}`),
    '',
    '## CRUD Matrix',
    '| Database | Table | Read | Write | Update | Delete |',
    '| --- | --- | ---: | ---: | ---: | ---: |',
    ...report.crudMatrix.map(
      (r) => `| ${r.database} | ${r.table} | ${r.read} | ${r.write} | ${r.update} | ${r.delete} |`
    ),
    '',
    '## Suggested Indexes',
    ...report.suggestedIndexes.map(
      (i) => `- **${i.database}.${i.table}.${i.column}** (${i.priority}): ${i.reason}`
    ),
    '',
    '## Missing Decisions',
    ...report.missingDecisions.map((m) => `- [${m.severity}] ${m.elementKey}: ${m.message}`),
    '',
    '## Architecture Suggestions',
    ...report.architectureSuggestions.map((s) => `- (${s.category}) ${s.message}`),
  ];
  return lines.join('\n');
}

export function formatSimulationReportJson(report: SimulationInsightsReport): string {
  return JSON.stringify(report, null, 2);
}
