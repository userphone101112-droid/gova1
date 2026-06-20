'use client';

import { useMemo } from 'react';

import { getBindingDisplayLabel } from '../data/element-binding-utils';
import type { ElementBinding } from '../data/element-binding.types';
import { InspectorBadge } from '../ui/InspectorBadge';
import { InspectorTree, type InspectorTreeNode } from '../ui/InspectorTree';

type BindingTreeProps = {
  bindings: ElementBinding[];
  activeBindingId: string;
  onSelect: (bindingId: string) => void;
};

export function BindingTree({ bindings, activeBindingId, onSelect }: BindingTreeProps) {
  const nodes = useMemo<InspectorTreeNode[]>(
    () =>
      bindings.map((binding) => ({
        id: binding.id,
        label: (
          <>
            <InspectorBadge kind={binding.kind} />
            <span className="min-w-0 truncate">{getBindingDisplayLabel(binding)}</span>
            {!binding.enabled ? (
              <span className="shrink-0 text-[10px] text-on-surface-variant">(off)</span>
            ) : null}
          </>
        ),
      })),
    [bindings]
  );

  return (
    <InspectorTree
      nodes={nodes}
      selectedId={activeBindingId}
      onSelect={onSelect}
      instanceId="binding-tree"
    />
  );
}
