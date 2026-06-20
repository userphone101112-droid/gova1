import type { InspectElementSnapshot, FrameCandidate } from '../../UiInspectorFrameBridge';
import type { InspectorDataMap } from '../data/inspector-config.types';
import type { RelationshipReverseIndexFile } from '../data/relationship-graph.types';
import { getFrameEligibleElements } from '../domain/inspector-domain';

// Suggestions should be a separate mode from persisted binding frames.
// Heuristic helpers live in inspector-file-layout-utils for a future Suggestions ON mode.

export type BuildFrameCandidatesOptions = {
  selectedIdentityKey?: string | null;
  reverseIndex?: RelationshipReverseIndexFile;
};

export function buildFrameCandidates(
  elements: InspectElementSnapshot[],
  inspectorData: InspectorDataMap,
  options?: BuildFrameCandidatesOptions
): FrameCandidate[] {
  return getFrameEligibleElements(inspectorData, elements, options);
}

export function selectFrameCandidates(state: {
  elements: InspectElementSnapshot[];
  allInspectorData: InspectorDataMap;
  selectedIdentityKey: string | null;
  relationshipReverseIndex?: RelationshipReverseIndexFile;
}): FrameCandidate[] {
  const frameOptions: BuildFrameCandidatesOptions = {
    selectedIdentityKey: state.selectedIdentityKey,
  };
  if (state.relationshipReverseIndex) {
    frameOptions.reverseIndex = state.relationshipReverseIndex;
  }
  return getFrameEligibleElements(state.allInspectorData, state.elements, frameOptions);
}
