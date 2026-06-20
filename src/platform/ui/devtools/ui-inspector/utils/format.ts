export function sectionChevron(open: boolean): string {
  return open ? ' [v]' : ' [>]';
}

export function formatScanTime(date: Date | null): string {
  if (!date) return 'never';
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function emptyDisplayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

export function saveStatusLabel(
  status: 'idle' | 'saving' | 'saved' | 'error',
  idleLabel: string
): string {
  if (status === 'saving') return 'Saving...';
  if (status === 'saved') return 'Saved';
  if (status === 'error') return 'Save failed';
  return idleLabel;
}

export function copyText(value: string): void {
  if (!value) return;
  void navigator.clipboard.writeText(value);
}

export function confirmAction(message: string): boolean {
  return window.confirm(message);
}
