import { execFileSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { generateTranslationKeyFromUi } from '@/platform/ui/i18n/binding/registry-binding';
import { createInspectorAssignedUiUuid } from '@/platform/ui/registry/identity-uuid';

type RegistrationPurpose = 'translation' | 'inspector-binding' | 'both';

interface RegisterElementRequest {
  sourceFile: string;
  sourceLine: number;
  sourceColumn?: number;
  tagName: string;
  domPath?: string;
  textSnippet?: string;
  route: string;
  requestedPurpose: RegistrationPurpose;
}

type UiCategory = 'action' | 'input' | 'navigation' | 'display' | 'container';

type RegisteredIdentity = {
  uuid: string;
  id: string;
  path: string;
  feature: string;
  propertyKey: string;
  registryConst: string;
  category: UiCategory;
};

const REGISTRY_FEATURES_DIR = path.join(process.cwd(), 'src', 'platform', 'ui', 'registry', 'features');
const UUID_MANIFEST_PATH = path.join(process.cwd(), 'src', 'platform', 'ui', 'registry', 'uuid-manifest.json');
const REGISTRY_MEMBER_PATHS_PATH = path.join(
  process.cwd(),
  'src',
  'platform',
  'ui',
  'registry',
  'registry-member-paths.json'
);
const LOCALES_DIR = path.join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'UI Inspector registration is only available in development' },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as RegisterElementRequest;
    const sourceFile = resolveSourceFile(body.sourceFile);

    if (!sourceFile || !body.sourceLine || !body.tagName) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceFile, sourceLine, tagName' },
        { status: 400 }
      );
    }

    const existingRef = findExistingRegistryRef(sourceFile, body.sourceLine);
    if (existingRef) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        registryRef: existingRef,
        message: 'Element already has a UUID-backed registry reference.',
      });
    }

    const identity = createRegisteredIdentity(body);
    addIdentityToRegistry(identity);
    addUuidToJsx(sourceFile, body.sourceLine, identity.registryConst, identity.propertyKey);

    if (body.requestedPurpose === 'translation' || body.requestedPurpose === 'both') {
      const translationKey = generateTranslationKeyFromUi(identity.path);
      upsertLocaleValue(identity.feature, 'en', translationKey, body.textSnippet || identity.propertyKey);
      upsertLocaleValue(identity.feature, 'ar', translationKey, body.textSnippet || identity.propertyKey);
      replaceHardcodedTextWithTranslation(sourceFile, body.sourceLine, body.textSnippet || '', translationKey);
    }

    refreshGeneratedRegistryFiles();

    return NextResponse.json({
      success: true,
      uuid: identity.uuid,
      id: identity.id,
      path: identity.path,
      feature: identity.feature,
      propertyKey: identity.propertyKey,
      registryRef: `${identity.registryConst}.${identity.propertyKey}.uuid`,
      message: 'UUID assigned successfully.',
    });
  } catch (error) {
    console.error('Error registering UI Inspector element:', error);
    return NextResponse.json(
      {
        error: 'Failed to register element',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function resolveSourceFile(input: string): string | null {
  const root = process.cwd();
  const normalizedInput = input.replace(/^file:\/+/, '').replace(/\\/g, path.sep);
  const candidate = path.isAbsolute(normalizedInput)
    ? path.normalize(normalizedInput)
    : path.normalize(path.join(root, normalizedInput.replace(/^\/+/, '')));

  const relative = path.relative(root, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  if (!candidate.includes(`${path.sep}src${path.sep}`)) return null;
  if (!existsSync(candidate)) return null;
  return candidate;
}

function findExistingRegistryRef(sourceFile: string, line: number): string | null {
  const content = readFileSync(sourceFile, 'utf-8');
  const lines = content.split(/\r?\n/);
  const lineText = lines[line - 1] ?? '';
  const match = lineText.match(/data-ui-uuid=\{([A-Z_][A-Z0-9_.]*)\.uuid\}/);
  return match?.[1] ?? null;
}

function createRegisteredIdentity(body: RegisterElementRequest): RegisteredIdentity {
  const feature = resolveFeature(body);
  const registryConst = toRegistryConst(feature);
  const category = inferCategory(body.tagName, body.requestedPurpose);
  const slug = slugify(body.textSnippet || body.domPath || body.tagName || 'element') || 'element';
  const tag = slugify(body.tagName || 'element') || 'element';
  const unique = createInspectorAssignedUiUuid().slice(0, 8);
  const propertyKey = `INSPECTOR_${tag}_${slug}_${unique}`.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  const id = `UI_${registryConst}_${propertyKey}`;
  const pathValue = `${feature}.inspector.${category}.${slug}-${unique}`;

  return {
    uuid: createInspectorAssignedUiUuid(),
    id,
    path: pathValue,
    feature,
    propertyKey,
    registryConst,
    category,
  };
}

function resolveFeature(body: RegisterElementRequest): string {
  const routeParts = body.route.split('/').filter(Boolean);
  const routeFeature = routeParts[0] === '(app)' ? routeParts[1] : routeParts[0];
  const raw = routeFeature || featureFromSourceFile(body.sourceFile) || 'shared-layout';
  const normalized = slugify(raw);
  const registryPath = path.join(REGISTRY_FEATURES_DIR, `${normalized}.ts`);
  return existsSync(registryPath) ? normalized : 'shared-layout';
}

function featureFromSourceFile(sourceFile: string): string | null {
  const parts = sourceFile.replace(/\\/g, '/').split('/');
  const componentIndex = parts.indexOf('components');
  if (componentIndex >= 0 && parts[componentIndex + 1]) return parts[componentIndex + 1];
  const appIndex = parts.indexOf('app');
  if (appIndex >= 0 && parts[appIndex + 1]) return parts[appIndex + 1].replace(/[()]/g, '');
  return null;
}

function toRegistryConst(feature: string): string {
  return feature.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36);
}

function inferCategory(tagName: string, purpose: RegistrationPurpose): UiCategory {
  const tag = tagName.toLowerCase();
  if (purpose === 'translation' || purpose === 'both') return 'display';
  if (['input', 'select', 'textarea'].includes(tag)) return 'container';
  return 'container';
}

function addIdentityToRegistry(identity: RegisteredIdentity): void {
  const registryPath = path.join(REGISTRY_FEATURES_DIR, `${identity.feature}.ts`);
  if (!existsSync(registryPath)) {
    throw new Error(`Registry file not found for feature "${identity.feature}".`);
  }

  const content = readFileSync(registryPath, 'utf-8');
  if (content.includes(`uuid: '${identity.uuid}'`) || content.includes(`id: '${identity.id}'`)) return;

  const today = new Date().toISOString().slice(0, 10);
  const entry = `  ${identity.propertyKey}: {
    uuid: '${identity.uuid}',
    id: '${identity.id}',
    path: '${identity.path}',
    lifecycle: 'active',
    description: 'Inspector assigned element',
    category: '${identity.category}',
    feature: '${identity.feature}',
    version: '1.0.0',
    createdAt: '${today}',
    updatedAt: '${today}',
  } as const,
`;

  const updated = content.replace(/\n} as const;\s*$/m, `\n${entry}} as const;\n`);
  if (updated === content) throw new Error(`Could not insert identity into ${registryPath}.`);
  writeFileSync(registryPath, updated, 'utf-8');
  updateUuidManifest(identity);
  updateRegistryMemberPaths(identity);
}

function updateUuidManifest(identity: RegisteredIdentity): void {
  const manifest = JSON.parse(readFileSync(UUID_MANIFEST_PATH, 'utf-8')) as {
    identities: Record<string, unknown>;
  };
  manifest.identities[identity.uuid] = {
    uuid: identity.uuid,
    id: identity.id,
    path: identity.path,
    feature: identity.feature,
    lifecycle: 'active',
    previousIds: [],
    previousPaths: [],
    aliases: [],
  };
  writeFileSync(UUID_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
}

function updateRegistryMemberPaths(identity: RegisteredIdentity): void {
  if (!existsSync(REGISTRY_MEMBER_PATHS_PATH)) return;
  const data = JSON.parse(readFileSync(REGISTRY_MEMBER_PATHS_PATH, 'utf-8')) as {
    paths?: string[];
    meta?: Record<string, unknown>;
  };
  const refPath = `${identity.registryConst}.${identity.propertyKey}`;
  data.paths = Array.from(new Set([...(data.paths ?? []), refPath])).sort();
  if (data.meta) {
    data.meta[refPath] = {
      path: identity.path,
      uuid: identity.uuid,
      feature: identity.feature,
      lifecycle: 'active',
      repeatable: false,
    };
  }
  writeFileSync(REGISTRY_MEMBER_PATHS_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function addUuidToJsx(sourceFile: string, line: number, registryConst: string, propertyKey: string): void {
  const content = readFileSync(sourceFile, 'utf-8');
  const lines = content.split(/\r?\n/);
  const index = line - 1;
  const lineText = lines[index] ?? '';
  if (!lineText || lineText.includes('data-ui-uuid=')) return;

  const updatedLine = lineText.replace(
    /(<[a-z][a-z0-9-]*)(\s|>)/i,
    `$1 data-ui-uuid={${registryConst}.${propertyKey}.uuid}$2`
  );
  if (updatedLine === lineText) throw new Error('Could not add data-ui-uuid to selected JSX element.');

  lines[index] = updatedLine;
  const withImport = ensureRegistryImport(lines.join('\n'), registryConst);
  writeFileSync(sourceFile, withImport, 'utf-8');
}

function ensureRegistryImport(content: string, registryConst: string): string {
  const platformImport = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@\/platform\/ui['"];?/);
  if (platformImport) {
    const names = platformImport[1].split(',').map((item) => item.trim()).filter(Boolean);
    if (names.includes(registryConst)) return content;
    const nextNames = [...names, registryConst].sort().join(', ');
    return content.replace(platformImport[0], `import { ${nextNames} } from '@/platform/ui';`);
  }
  return `import { ${registryConst} } from '@/platform/ui';\n${content}`;
}

function replaceHardcodedTextWithTranslation(sourceFile: string, line: number, text: string, key: string): void {
  if (!text.trim()) return;
  const content = readFileSync(sourceFile, 'utf-8');
  const lines = content.split(/\r?\n/);
  const index = line - 1;
  const lineText = lines[index] ?? '';
  if (!lineText.includes(text)) return;
  lines[index] = lineText.replace(text, `{t('${key}')}`);
  const withHook = ensureTranslationHook(lines.join('\n'));
  writeFileSync(sourceFile, withHook, 'utf-8');
}

function ensureTranslationHook(content: string): string {
  if (content.includes('useTranslation()')) return content;
  const withImport = ensureRegistryImport(content, 'useTranslation');
  return withImport.replace(/(export\s+default\s+function\s+\w+\([^)]*\)\s*\{\s*)/, `$1\n  const { t } = useTranslation();\n`);
}

function upsertLocaleValue(feature: string, locale: 'en' | 'ar', translationKey: string, value: string): void {
  const filePath = path.join(LOCALES_DIR, feature, `${locale}.json`);
  if (!existsSync(filePath)) return;
  const data = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
  const parts = translationKey.split('.');
  let target: Record<string, unknown> = data;
  for (const part of parts.slice(0, -1)) {
    if (!target[part] || typeof target[part] !== 'object') target[part] = {};
    target = target[part] as Record<string, unknown>;
  }
  target[parts[parts.length - 1]] = value;
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function refreshGeneratedRegistryFiles(): void {
  execFileSync('cmd', ['/c', 'npm', 'run', 'registry:generate'], {
    cwd: process.cwd(),
    stdio: 'ignore',
  });
}
