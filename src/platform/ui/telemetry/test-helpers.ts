/**
 * Playwright Testing Utilities — UUID-first UI identity.
 */

export function getByUiUuid(page: unknown, uuid: string): unknown {
  if (!page || typeof (page as { locator?: unknown }).locator !== 'function') {
    throw new Error('[UI Test Helpers] Invalid Page object passed to getByUiUuid.');
  }
  return (page as { locator: (s: string) => unknown }).locator(`[data-ui-uuid="${uuid}"]`);
}

export function getByUiInstance(page: unknown, uuid: string, instanceId: string | number): unknown {
  if (!page || typeof (page as { locator?: unknown }).locator !== 'function') {
    throw new Error('[UI Test Helpers] Invalid Page object passed to getByUiInstance.');
  }
  return (page as { locator: (s: string) => unknown }).locator(
    `[data-ui-identity-key="${uuid}:${String(instanceId)}"]`
  );
}

export function getByUiIdentityKey(page: unknown, identityKey: string): unknown {
  if (!page || typeof (page as { locator?: unknown }).locator !== 'function') {
    throw new Error('[UI Test Helpers] Invalid Page object passed to getByUiIdentityKey.');
  }
  return (page as { locator: (s: string) => unknown }).locator(`[data-ui-identity-key="${identityKey}"]`);
}

/** @deprecated Removed — use getByUiUuid. data-ui-id is no longer emitted. */
export function getByUiId(_page: unknown, _id: string): never {
  throw new Error('[UI Test Helpers] getByUiId is removed. Use getByUiUuid with identity.uuid.');
}

/** @deprecated Removed — use getByUiUuid. data-ui-path is no longer emitted. */
export function getByUiPath(_page: unknown, _path: string): never {
  throw new Error('[UI Test Helpers] getByUiPath is removed. Use getByUiUuid with identity.uuid.');
}

/** @deprecated Removed — query by feature via registry, not DOM attributes. */
export function getByUiFeature(_page: unknown, _feature: string): never {
  throw new Error('[UI Test Helpers] getByUiFeature is removed. Use getByUiUuid.');
}
