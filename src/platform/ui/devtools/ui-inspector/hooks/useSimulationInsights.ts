'use client';

import { useMemo } from 'react';

import { runSimulationAnalysis } from '../analysis/simulation-analysis';
import {
  formatSimulationReportJson,
  formatSimulationReportMarkdown,
} from '../analysis/simulation-report-format';
import { useInspectorContext } from '../state/InspectorProvider';

export function useSimulationInsights() {
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

  return {
    report,
    copyJson: () => formatSimulationReportJson(report),
    copyMarkdown: () => formatSimulationReportMarkdown(report),
  };
}
