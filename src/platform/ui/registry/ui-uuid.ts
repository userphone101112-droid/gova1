import type { UiIdentity } from './types';

/**
 * Optional helper — prefer inline `data-ui-uuid={IDENTITY.uuid}` in JSX.
 */
export function uiUuid(identity: UiIdentity): { 'data-ui-uuid': string } {
  return { 'data-ui-uuid': identity.uuid };
}
