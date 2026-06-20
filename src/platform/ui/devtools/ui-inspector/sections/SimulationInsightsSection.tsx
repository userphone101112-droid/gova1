'use client';

import { useMemo } from 'react';

import { runSimulationAnalysis } from '../analysis/simulation-analysis';
import {
  formatSimulationReportJson,
  formatSimulationReportMarkdown,
} from '../analysis/simulation-report-format';
import { useInspectorContext } from '../state/InspectorProvider';
import { InspectorActionButton } from '../ui/InspectorActionButton';
import { InspectorPanel } from '../ui/InspectorPanel';

export function SimulationInsightsSection() {
  const { state } = useInspectorContext();

  const report = useMemo(
    () =>
      runSimulationAnalysis({
        inspectorData: state.allInspectorData,
        databaseRef: state.databaseRef,
        storageRef: state.storageRef,
      }),
    [state.allInspectorData, state.databaseRef, state.storageRef]
  );

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col gap-2 px-2 pb-3">
      <p className="text-[10px] text-on-surface-variant">Analyze saved bindings to guide architecture decisions.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Saved" value={report.savedElements} tone="primary" />
        <StatCard label="Linked" value={report.linkedElements} tone="secondary" />
        <StatCard label="Unbound" value={report.unboundElements} tone="warning" />
        <StatCard label="Bindings" value={report.totalBindings} tone="tertiary" />
      </div>

      <InspectorPanel title="Database usage" description="Top column references." tone="tertiary" instanceId="sim-db-usage">
        <MiniTable rows={report.columnUsage.slice(0, 8).map((u) => [u.label, String(u.count)])} />
      </InspectorPanel>

      <InspectorPanel title="CRUD matrix" description="Read/write patterns per table." tone="primary" instanceId="sim-crud">
        <MiniTable
          headers={['Table', 'R', 'W', 'U', 'D']}
          rows={report.crudMatrix.slice(0, 8).map((r) => [
            `${r.database}.${r.table}`,
            String(r.read),
            String(r.write),
            String(r.update),
            String(r.delete),
          ])}
        />
      </InspectorPanel>

      <InspectorPanel title="Missing decisions" description="Items needing architect review." tone="warning" instanceId="sim-missing">
        {report.missingDecisions.length === 0 ? (
          <p className="text-xs text-on-surface-variant">No missing decisions.</p>
        ) : (
          <ul className="list-inside list-disc text-xs">
            {report.missingDecisions.slice(0, 10).map((item, index) => (
              <li key={`${item.elementKey}-${index}`}>
                [{item.severity}] {item.message}
              </li>
            ))}
          </ul>
        )}
      </InspectorPanel>

      <InspectorPanel title="Architecture suggestions" description="Copy-ready hints." tone="secondary" instanceId="sim-suggestions">
        <ul className="list-inside list-disc text-xs">
          {report.architectureSuggestions.map((s) => (
            <li key={s.id}>{s.message}</li>
          ))}
        </ul>
      </InspectorPanel>

      <InspectorPanel
        title="Relationship Graph"
        description="Nodes, edges, and shared binding groups."
        tone="tertiary"
        instanceId="sim-relationship-graph"
      >
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Nodes: {report.relationshipGraph.nodeCount}</div>
          <div>Edges: {report.relationshipGraph.edgeCount}</div>
        </div>
        {report.relationshipGraph.mostConnected.length > 0 ? (
          <MiniTable
            headers={['Element', 'Connections']}
            rows={report.relationshipGraph.mostConnected.map((item) => [
              item.identityKey,
              String(item.count),
            ])}
          />
        ) : null}
        {report.relationshipGraph.missingLinkedTargets.length > 0 ? (
          <div className="mt-2 text-xs text-error">
            Missing linked targets: {report.relationshipGraph.missingLinkedTargets.join(', ')}
          </div>
        ) : null}
        {report.relationshipGraph.circularDependencies.length > 0 ? (
          <div className="mt-2 text-xs text-warning">
            Circular dependencies: {report.relationshipGraph.circularDependencies.length}
          </div>
        ) : null}
        {report.relationshipGraph.sharedDatabaseGroups.length > 0 ? (
          <MiniTable
            headers={['Shared DB column', 'Members']}
            rows={report.relationshipGraph.sharedDatabaseGroups.map((group) => [
              group.key,
              group.members.join(', '),
            ])}
          />
        ) : null}
        {report.relationshipGraph.sharedStorageGroups.length > 0 ? (
          <MiniTable
            headers={['Shared storage', 'Members']}
            rows={report.relationshipGraph.sharedStorageGroups.map((group) => [
              group.key,
              group.members.join(', '),
            ])}
          />
        ) : null}
      </InspectorPanel>

      <div className="flex flex-wrap gap-2">
        <InspectorActionButton variant="secondary" onClick={() => void copy(formatSimulationReportJson(report))} instanceId="sim-copy-json">
          Copy JSON
        </InspectorActionButton>
        <InspectorActionButton variant="secondary" onClick={() => void copy(formatSimulationReportMarkdown(report))} instanceId="sim-copy-md">
          Copy Markdown
        </InspectorActionButton>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'primary' | 'secondary' | 'tertiary' | 'warning' }) {
  const toneClass =
    tone === 'primary'
      ? 'border-primary/30 bg-primary/10'
      : tone === 'secondary'
        ? 'border-secondary/30 bg-secondary/10'
        : tone === 'warning'
          ? 'border-warning/30 bg-warning/10'
          : 'border-tertiary/30 bg-tertiary/10';
  return (
    <div className={`rounded border px-2 py-2 text-center ${toneClass}`}>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-on-surface-variant">{label}</div>
    </div>
  );
}

function MiniTable({ headers, rows }: { headers?: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        {headers ? (
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} className="border-b border-outline-variant/50 py-1 pe-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border-b border-outline-variant/30 py-1 pe-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
