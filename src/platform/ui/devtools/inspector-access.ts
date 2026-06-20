/** Shared gate for UI Inspector page, API, and inspect bridge. */
export function isUiInspectorEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_UI_INSPECTOR === 'true'
  );
}
