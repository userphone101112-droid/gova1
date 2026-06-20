export type SidebarSectionTone =
  | 'header'
  | 'display'
  | 'dbAttributes'
  | 'dbManagement'
  | 'storageManagement'
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
  dbAttributes: {
    shell: 'border-b border-secondary/30 bg-secondary/5',
    toggle: 'bg-secondary/10 hover:bg-secondary/15 text-on-surface border-b border-secondary/25',
    content: 'bg-secondary/[0.04]',
    label: 'text-secondary',
  },
  dbManagement: {
    shell: 'border-b border-tertiary/30 bg-tertiary/5',
    toggle: 'bg-tertiary/10 hover:bg-tertiary/15 text-on-surface border-b border-tertiary/25',
    content: 'bg-tertiary/[0.04]',
    label: 'text-tertiary',
  },
  storageManagement: {
    shell: 'border-b border-success/30 bg-success/5',
    toggle: 'bg-success/10 hover:bg-success/15 text-on-surface border-b border-success/25',
    content: 'bg-success/[0.04]',
    label: 'text-success',
  },
  filters: {
    shell: 'border-b border-warning/25 bg-warning/5',
    toggle: 'bg-warning/10 hover:bg-warning/15 text-on-surface border-b border-warning/20',
    content: 'bg-warning/[0.03]',
    label: 'text-on-surface',
  },
  elements: {
    shell: 'border-b border-error/20 bg-error/5',
    toggle: 'bg-error/10 hover:bg-error/15 text-on-surface border-b border-error/15',
    content: 'bg-error/[0.03]',
    label: 'text-on-surface',
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
      : tone === 'dbAttributes'
        ? 'border-s-secondary'
        : tone === 'dbManagement'
          ? 'border-s-tertiary'
          : tone === 'storageManagement'
            ? 'border-s-success'
            : tone === 'filters'
              ? 'border-s-warning'
              : tone === 'elements'
                ? 'border-s-error'
                : 'border-s-outline-variant';
  return `${sidebarSectionButtonBase} ${accent} ${styles.toggle}`;
}

export function sidebarSectionLabelClass(tone: SidebarSectionTone): string {
  return `block px-3 py-2 text-sm font-medium ${TONE_STYLES[tone].label}`;
}
