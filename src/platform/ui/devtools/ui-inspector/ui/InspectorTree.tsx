'use client';

import type { ReactNode } from 'react';

export type InspectorTreeNode = {
  id: string;
  label: ReactNode;
  children?: InspectorTreeNode[];
};

type InspectorTreeProps = {
  nodes: InspectorTreeNode[];
  selectedId?: string;
  onSelect: (id: string) => void;
  instanceId?: string;
  depth?: number;
};

export function InspectorTree({
  nodes,
  selectedId,
  onSelect,
  instanceId,
  depth = 0,
}: InspectorTreeProps) {
  return (
    <ul
      {...(instanceId && depth === 0 ? { 'data-ui-instance-id': instanceId } : {})}
      className={depth === 0 ? 'flex flex-col gap-0.5' : 'ms-3 flex flex-col gap-0.5 border-s border-outline-variant/50 ps-2'}
    >
      {nodes.map((node) => {
        const selected = node.id === selectedId;
        return (
          <li key={node.id}>
            <button
              type="button"
              data-ui-instance-id={instanceId ? `${instanceId}-node-${node.id}` : undefined}
              onClick={() => onSelect(node.id)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-start text-xs ${
                selected ? 'bg-primary/15 font-medium text-primary' : 'hover:bg-surface-container'
              }`}
            >
              {node.label}
            </button>
            {node.children?.length ? (
              <InspectorTree
                nodes={node.children}
                {...(selectedId !== undefined ? { selectedId } : {})}
                onSelect={onSelect}
                {...(instanceId !== undefined ? { instanceId } : {})}
                depth={depth + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
