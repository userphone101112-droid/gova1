export type SidebarSectionTone =
  | 'header'
  | 'display'
  | 'elementBindings'
  | 'databaseCatalog'
  | 'storageCatalog'
  | 'simulationInsights'
  | 'filters'
  | 'elements'
  | 'details';

export type SidebarSubpanelTone = 'database' | 'storage' | 'attributes';

const TONE_STYLES: Record<
  SidebarSectionTone,
  { shell: string; toggle: string; content: string; label: string }
> = {
  header: {
    shell: 'border-b border-outline-variant bg-surface-container-low',
    toggle: '',
    content: '',
    label: 'text-on-surface',
  },
  display: {
    shell: 'border-b border-primary/25 bg-primary/5',
    toggle: 'bg-primary/10 hover:bg-primary/15 text-on-surface border-b border-primary/20',
    content: 'bg-primary/[0.03]',
    label: 'text-primary',
  },
  elementBindings: {
    shell: 'border-b border-secondary/30 bg-secondary/5',
    toggle: 'bg-secondary/10 hover:bg-secondary/15 text-on-surface border-b border-secondary/25',
    content: 'bg-secondary/[0.04]',
    label: 'text-secondary',
  },
  databaseCatalog: {
    shell: 'border-b border-tertiary/30 bg-tertiary/5',
    toggle: 'bg-tertiary/10 hover:bg-tertiary/15 text-on-surface border-b border-tertiary/25',
    content: 'bg-tertiary/[0.04]',
    label: 'text-tertiary',
  },
  storageCatalog: {
    shell: 'border-b border-warning/30 bg-warning/5',
    toggle: 'bg-warning/10 hover:bg-warning/15 text-on-surface border-b border-warning/25',
    content: 'bg-warning/[0.04]',
    label: 'text-on-surface',
  },
  simulationInsights: {
    shell: 'border-b border-teal-500/25 bg-teal-500/5',
    toggle: 'bg-teal-500/10 hover:bg-teal-500/15 text-on-surface border-b border-teal-500/20',
    content: 'bg-teal-500/[0.03]',
    label: 'text-on-surface',
  },
  filters: {
    shell: 'border-b border-outline-variant bg-surface-container-low/60',
    toggle: 'bg-surface-container hover:bg-surface-container-high text-on-surface border-b border-outline-variant',
    content: 'bg-surface-container-low/40',
    label: 'text-on-surface-variant',
  },
  elements: {
    shell: 'border-b border-outline-variant bg-surface-container-low/60',
    toggle: 'bg-surface-container hover:bg-surface-container-high text-on-surface border-b border-outline-variant',
    content: 'bg-surface-container-low/40',
    label: 'text-on-surface-variant',
  },
  details: {
    shell: 'border-b border-outline bg-surface-container',
    toggle: 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-b border-outline-variant',
    content: 'bg-surface-container-low/80',
    label: 'text-on-surface-variant',
  },
};

const SUBPANEL_STYLES: Record<SidebarSubpanelTone, string> = {
  database:
    'mx-2 mb-2 rounded-md border border-primary/20 bg-primary/10 px-1 py-1 shadow-sm',
  storage:
    'mx-2 mb-2 rounded-md border border-success/20 bg-success/10 px-1 py-1 shadow-sm',
  attributes:
    'mx-2 mb-2 rounded-md border border-secondary/20 bg-secondary/10 px-1 py-1 shadow-sm',
};

export function getSidebarSectionTone(tone: SidebarSectionTone) {
  return TONE_STYLES[tone];
}

export function getSidebarSubpanelClass(tone: SidebarSubpanelTone): string {
  return SUBPANEL_STYLES[tone];
}

export const sidebarSectionButtonBase =
  'flex w-full shrink-0 items-center px-3 py-2 text-start text-sm font-medium border-s-4';

export function sidebarSectionToggleClass(tone: SidebarSectionTone): string {
  const styles = TONE_STYLES[tone];
  const accent =
    tone === 'display'
      ? 'border-s-primary'
      : tone === 'elementBindings'
        ? 'border-s-secondary'
        : tone === 'databaseCatalog'
          ? 'border-s-tertiary'
          : tone === 'storageCatalog'
            ? 'border-s-warning'
            : tone === 'simulationInsights'
              ? 'border-s-teal-500'
              : 'border-s-outline-variant';
  return `${sidebarSectionButtonBase} ${accent} ${styles.toggle}`;
}

export function sidebarSectionLabelClass(tone: SidebarSectionTone): string {
  return `block px-3 py-2 text-sm font-medium ${TONE_STYLES[tone].label}`;
}
