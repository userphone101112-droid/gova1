/**
 * Internal registry maps — migration scripts and validation only.
 * Not exported from @/platform/ui public API.
 */

import { getUiIdentityUuid } from './identity-uuid';
import type { UiIdentity } from './types';

export function buildInternalMaps(identities: readonly UiIdentity[]) {
  const UI_ID_MAP = identities.reduce(
    (acc, identity) => {
      acc[identity.id] = identity;
      return acc;
    },
    {} as Record<string, UiIdentity>
  );

  const UI_PATH_MAP = identities.reduce(
    (acc, identity) => {
      acc[identity.path] = identity;
      return acc;
    },
    {} as Record<string, UiIdentity>
  );

  const UI_UUID_MAP = identities.reduce(
    (acc, identity) => {
      acc[getUiIdentityUuid(identity)] = identity;
      return acc;
    },
    {} as Record<string, UiIdentity>
  );

  const UI_ALIAS_MAP = identities.reduce(
    (acc, identity) => {
      const aliases = [
        ...(identity.previousIds ?? []),
        ...(identity.previousPaths ?? []),
        ...(identity.aliases ?? []),
      ];
      aliases.forEach((alias) => {
        acc[alias] = identity;
      });
      return acc;
    },
    {} as Record<string, UiIdentity>
  );

  return { UI_ID_MAP, UI_PATH_MAP, UI_UUID_MAP, UI_ALIAS_MAP };
}
