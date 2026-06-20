'use client';

type InspectorEmptyStateProps = {
  title: string;
  description?: string;
  instanceId?: string;
};

export function InspectorEmptyState({ title, description, instanceId }: InspectorEmptyStateProps) {
  return (
    <div
      {...(instanceId ? { 'data-ui-instance-id': instanceId } : {})}
      className="rounded-md border border-dashed border-outline-variant bg-surface-container-low/50 px-4 py-6 text-center"
    >
      <p className="text-sm font-medium text-on-surface">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-on-surface-variant">{description}</p>
      ) : null}
    </div>
  );
}
