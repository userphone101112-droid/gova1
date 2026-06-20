/**
 * Shared UUID DOM validation (ESLint rule + CI guards).
 * Absolute mode: every intrinsic JSX element must carry data-ui-uuid={REGISTRY.PATH.uuid}.
 */

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const BANNED_PATH_PREFIXES = ['COMMON_', 'DECORATIVE'];
const BANNED_PATH_SEGMENTS = ['.STRUCTURE.'];

function loadRegistryMemberPaths() {
  const pathsFile = join(process.cwd(), 'src/platform/ui/registry/registry-member-paths.json');
  if (!existsSync(pathsFile)) {
    return { paths: new Set(), pathToUuid: new Map() };
  }
  const data = JSON.parse(readFileSync(pathsFile, 'utf-8'));
  return { paths: new Set(data.paths || []), pathToUuid: new Map() };
}

function loadRegistryMeta() {
  const manifestPath = join(process.cwd(), 'src/platform/ui/registry/uuid-manifest.json');
  if (!existsSync(manifestPath)) {
    return { uuids: new Set(), repeatableByPath: new Map(), pathByUuid: new Map() };
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const uuids = new Set(Object.keys(manifest.identities || {}));
  const repeatableByPath = new Map();
  const pathByUuid = new Map();
  for (const entry of Object.values(manifest.identities || {})) {
    if (!entry?.path) continue;
    pathByUuid.set(entry.uuid, entry.path);
    if (entry.repeatable === true) {
      repeatableByPath.set(entry.path, true);
    }
  }
  return { uuids, repeatableByPath, pathByUuid };
}

function getJsxTagName(name) {
  if (!name || name.type !== 'JSXIdentifier') return null;
  return name.name;
}

function getAttribute(node, attrName) {
  return node.attributes?.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name?.name === attrName
  );
}

function isIntrinsicElement(node) {
  const tagName = getJsxTagName(node.name);
  if (!tagName) return false;
  return tagName === tagName.toLowerCase() && /^[a-z]/.test(tagName);
}

function memberChainToPath(node) {
  const parts = [];
  let current = node;
  while (current?.type === 'MemberExpression') {
    if (current.computed) return null;
    if (current.property?.type !== 'Identifier') return null;
    parts.unshift(current.property.name);
    current = current.object;
  }
  if (current?.type !== 'Identifier') return null;
  parts.unshift(current.name);
  return parts.join('.');
}

function isBannedRegistryPath(path, filename = '') {
  if (!path) return true;
  if (BANNED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  if (BANNED_PATH_SEGMENTS.some((segment) => path.includes(segment))) return true;
  if (path.startsWith('DEVTOOLS.') && !filename.replace(/\\/g, '/').includes('/devtools/')) {
    return true;
  }
  return false;
}

function validateRegistryUuidExpression(expression, registryPaths, filename = '') {
  if (!expression || expression.type !== 'MemberExpression') {
    return { valid: false, reason: 'notMemberExpression' };
  }
  if (expression.computed) {
    return { valid: false, reason: 'computed' };
  }
  if (expression.property?.type !== 'Identifier' || expression.property.name !== 'uuid') {
    return { valid: false, reason: 'notUuidProperty' };
  }
  const path = memberChainToPath(expression.object);
  if (!path) {
    return { valid: false, reason: 'invalidChain' };
  }
  if (isBannedRegistryPath(path, filename)) {
    return { valid: false, reason: 'bannedGeneric', path };
  }
  if (!registryPaths.paths.has(path)) {
    return { valid: false, reason: 'unknownPath', path };
  }
  return { valid: true, path };
}

function validateOpeningElement(node, registryPaths, filename = '') {
  const uuidAttr = getAttribute(node, 'data-ui-uuid');
  const spreadAttrs = node.attributes.filter((a) => a.type === 'JSXSpreadAttribute');

  if (spreadAttrs.length > 0) {
    return { valid: false, reason: 'forbiddenSpread' };
  }

  if (!uuidAttr) {
    return { valid: false, reason: 'missing' };
  }

  if (!uuidAttr.value || uuidAttr.value.type !== 'JSXExpressionContainer') {
    return { valid: false, reason: 'invalidAttr' };
  }

  const expr = uuidAttr.value.expression;
  if (expr?.type === 'Literal' || expr?.type === 'ConditionalExpression') {
    return { valid: false, reason: 'invalidUuid' };
  }

    const result = validateRegistryUuidExpression(expr, registryPaths, filename);
  if (!result.valid) return result;

  if (isBannedRegistryPath(result.path, filename)) {
    return { valid: false, reason: 'bannedGeneric', path: result.path };
  }

  return { valid: true, path: result.path };
}

module.exports = {
  UUID_REGEX,
  loadRegistryMemberPaths,
  loadRegistryMeta,
  getJsxTagName,
  getAttribute,
  isIntrinsicElement,
  memberChainToPath,
  isBannedRegistryPath,
  validateRegistryUuidExpression,
  validateOpeningElement,
};
