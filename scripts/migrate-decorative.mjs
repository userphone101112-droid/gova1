import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const COMPONENT_LAYOUT_MAP = {
  UiSection: 'COMMON_LAYOUT.SECTION',
  UiMain: 'COMMON_LAYOUT.MAIN',
  UiArticle: 'COMMON_LAYOUT.ARTICLE',
  UiAside: 'COMMON_LAYOUT.ASIDE',
  UiNav: 'COMMON_LAYOUT.NAV',
  UiHeader: 'COMMON_LAYOUT.HEADER',
  UiFooter: 'COMMON_LAYOUT.FOOTER',
  UiSpan: 'COMMON_LAYOUT.SPAN',
};

const DEFAULT_LAYOUT = 'COMMON_LAYOUT.CONTAINER';
const WRAPPER_HINT =
  /className="[^"]*(?:flex|grid|gap|relative|items-|justify-)/;

function migrateFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  if (!content.includes('DECORATIVE')) return false;

  let changed = false;

  for (const [tag, layout] of Object.entries(COMPONENT_LAYOUT_MAP)) {
    const re = new RegExp(`<${tag}\\s+ui=\\{DECORATIVE\\.SPACER\\}`, 'g');
    if (re.test(content)) {
      content = content.replace(re, `<${tag} ui={${layout}}`);
      changed = true;
    }
  }

  const divRe = /<UiDiv\s+ui=\{DECORATIVE\.SPACER\}([^>]*)>/g;
  content = content.replace(divRe, (_, attrs) => {
    changed = true;
    const layout = WRAPPER_HINT.test(attrs) ? 'COMMON_LAYOUT.WRAPPER' : 'COMMON_LAYOUT.CONTAINER';
    return `<UiDiv ui={${layout}}${attrs}>`;
  });

  if (content.includes('DECORATIVE.SPACER')) {
    content = content.replace(/ui=\{DECORATIVE\.SPACER\}/g, `ui={${DEFAULT_LAYOUT}}`);
    changed = true;
  }

  if (changed) {
    if (content.includes('COMMON_LAYOUT') && !content.includes('COMMON_LAYOUT')) {
      // noop
    }
    if (content.includes('COMMON_LAYOUT.')) {
      if (/import \{ DECORATIVE \}/.test(content)) {
        content = content.replace(
          /import \{ DECORATIVE \} from '@\/platform\/ui\/registry\/categories';/,
          "import { COMMON_LAYOUT, DECORATIVE } from '@/platform/ui/registry/categories';"
        );
      } else if (!content.includes('COMMON_LAYOUT')) {
        content = content.replace(
          /import \{ DECORATIVE, COMMON_LAYOUT \}/,
          "import { COMMON_LAYOUT, DECORATIVE }"
        );
      }
      if (!content.includes('COMMON_LAYOUT')) {
        content = content.replace(
          /import \{ ([^}]+) \} from '@\/platform\/ui\/registry\/categories';/,
          (m, imports) => {
            if (imports.includes('COMMON_LAYOUT')) return m;
            return `import { COMMON_LAYOUT, ${imports} } from '@/platform/ui/registry/categories';`;
          }
        );
      }
    }

    if (!content.includes('DECORATIVE.') && content.includes("import { COMMON_LAYOUT, DECORATIVE }")) {
      content = content.replace(
        /import \{ COMMON_LAYOUT, DECORATIVE \} from '@\/platform\/ui\/registry\/categories';/,
        "import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';"
      );
    } else if (!content.includes('DECORATIVE.') && /import \{ DECORATIVE, COMMON_LAYOUT \}/.test(content)) {
      content = content.replace(
        /import \{ DECORATIVE, COMMON_LAYOUT \} from '@\/platform\/ui\/registry\/categories';/,
        "import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';"
      );
    } else if (content.includes('DECORATIVE.') && !/COMMON_LAYOUT/.test(content.split('from')[0])) {
      content = content.replace(
        /import \{ DECORATIVE \} from '@\/platform\/ui\/registry\/categories';/,
        "import { COMMON_LAYOUT, DECORATIVE } from '@/platform/ui/registry/categories';"
      );
    }

    writeFileSync(filePath, content, 'utf8');
  }

  return changed;
}

function walk(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') count += walk(full);
    else if (entry.name.endsWith('.tsx') && migrateFile(full)) {
      console.log('migrated', full);
      count += 1;
    }
  }
  return count;
}

const root = join(process.cwd(), 'src', 'components');
console.log(`Migrated ${walk(root)} files`);
