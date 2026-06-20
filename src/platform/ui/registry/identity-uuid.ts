import type { UiIdentity } from './types';

export const UI_UUID_NAMESPACE = 'gova.ui-registry';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fnv1a32(input: string, seed: number): number {
  let hash = 0x811c9dc5 ^ seed;

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function toHex32(value: number): string {
  return value.toString(16).padStart(8, '0');
}

/**
 * Creates a deterministic UUID-shaped value for legacy identities that do not
 * yet have an explicit immutable uuid field.
 */
export function createDeterministicUiUuid(seed: string): string {
  const source = `${UI_UUID_NAMESPACE}:${seed}`;
  const hex = [
    toHex32(fnv1a32(source, 0)),
    toHex32(fnv1a32(source, 1)),
    toHex32(fnv1a32(source, 2)),
    toHex32(fnv1a32(source, 3)),
  ].join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

export function isValidUiUuid(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

export function getUiIdentityUuid(identity: UiIdentity): string {
  return identity.uuid;
}
