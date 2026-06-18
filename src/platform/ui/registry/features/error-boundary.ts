/** Auto-split from registry.ts */
export const ERROR_BOUNDARY = {
  TITLE: {
    id: 'UI_ERROR_BOUNDARY_TITLE',
    path: 'error-boundary.main.display.title',
    description: 'Error boundary title',
    category: 'display',
    feature: 'error-boundary',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  DEFAULT_MESSAGE: {
    id: 'UI_ERROR_BOUNDARY_DEFAULT_MESSAGE',
    path: 'error-boundary.main.display.default-message',
    description: 'Error boundary default message',
    category: 'display',
    feature: 'error-boundary',
    version: '1.0.0',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-17',
  } as const,
  RELOAD_BUTTON: {
    id: 'UI_ERROR_BOUNDARY_RELOAD',
    path: 'error-boundary.main.actions.reload-button',
    description: 'Reload button for crashed application state',
    category: 'action',
    feature: 'error-boundary',
    version: '1.0.0',
    createdAt: '2026-06-15',
    updatedAt: '2026-06-15',
  } as const,
} as const;