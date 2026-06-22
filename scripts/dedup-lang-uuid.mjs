import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', 'scripts'].includes(entry.name)) continue;
      yield* walk(full);
    } else if (['.tsx', '.ts'].includes(extname(entry.name))) {
      if (!entry.name.endsWith('.d.ts')) yield full;
    }
  }
}

let fixed = 0;

for (const filePath of walk(SRC)) {
  let content = readFileSync(filePath, 'utf-8');
  
  // Find duplicate data-ui-lang-uuid within the same tag (does not cross '>')
  const regex = /(data-ui-lang-uuid\s*=\s*(?:\{`lang-\$\{[^`]+\}`\}|\{"lang-[^"]+"\}|'lang-[^']+'|"lang-[^"]+"))([^>]*?)\s*\1/g;
  
  let deduped = content;
  let hasChange = false;
  
  while (true) {
    const next = deduped.replace(regex, '$1$2');
    if (next === deduped) break;
    deduped = next;
    hasChange = true;
  }
  
  if (hasChange) {
    writeFileSync(filePath, deduped, 'utf-8');
    fixed++;
    console.log(`✅ Deduped: ${filePath.replace(ROOT, '').replace(/\\/g, '/')}`);
  }
}

console.log(`\n✔ Deduplication done. Fixed ${fixed} files.`);
