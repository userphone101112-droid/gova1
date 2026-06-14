import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// ─── Setup ───────────────────────────────────────────────────────────────────
const ROOT_DIR = path.join(process.cwd());
const DB_PATH = path.join(ROOT_DIR, 'database', 'settings.db');

const db = new Database(DB_PATH, { readonly: true });

type CategoryRow = { image: string; title_en: string };
type SubcategoryRow = { image: string; title_en: string };

// ─── Image Validation ────────────────────────────────────────────────────────
async function validateImages(): Promise<void> {
  console.log('=== Image Validation Report ===\n');

  // ── Categories ──────────────────────────────────────────────────────────
  const cats = db.prepare('SELECT image, title_en FROM categories').all() as CategoryRow[];
  const mainCategoriesPath = path.join(ROOT_DIR, 'public', 'images', 'mainCategories');

  let categoriesMatched = 0;
  let categoriesMissing = 0;
  const missingCategories: string[] = [];

  if (fs.existsSync(mainCategoriesPath)) {
    const mainCategoryFiles = fs.readdirSync(mainCategoriesPath);
    for (const cat of cats) {
      if (mainCategoryFiles.includes(cat.image)) {
        categoriesMatched++;
      } else {
        categoriesMissing++;
        missingCategories.push(cat.image);
      }
    }
  } else {
    console.warn(`⚠ Directory not found: ${mainCategoriesPath}`);
    categoriesMissing = cats.length;
  }

  console.log('Categories:');
  console.log(`- Total:   ${cats.length}`);
  console.log(`- Matched: ${categoriesMatched}`);
  console.log(`- Missing: ${categoriesMissing}`);
  if (missingCategories.length > 0) {
    console.log('- Missing files:', missingCategories);
  }

  // ── Subcategories ────────────────────────────────────────────────────────
  const subs = db.prepare('SELECT image, title_en FROM subcategories').all() as SubcategoryRow[];
  const subCategoriesPath = path.join(ROOT_DIR, 'public', 'images', 'subCategories');

  let subcategoriesMatched = 0;
  let subcategoriesMissing = 0;
  const missingSubcategories: string[] = [];

  if (fs.existsSync(subCategoriesPath)) {
    const subCategoryFiles = fs.readdirSync(subCategoriesPath);
    for (const sub of subs) {
      if (subCategoryFiles.includes(sub.image)) {
        subcategoriesMatched++;
      } else {
        subcategoriesMissing++;
        missingSubcategories.push(sub.image);
      }
    }
  } else {
    console.warn(`⚠ Directory not found: ${subCategoriesPath}`);
    subcategoriesMissing = subs.length;
  }

  console.log('\nSubcategories:');
  console.log(`- Total:   ${subs.length}`);
  console.log(`- Matched: ${subcategoriesMatched}`);
  console.log(`- Missing: ${subcategoriesMissing}`);
  if (missingSubcategories.length > 0) {
    console.log('- Missing files:', missingSubcategories);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n=== Summary ===');
  console.log(`Total images matched: ${categoriesMatched + subcategoriesMatched}`);
  console.log(`Total images missing: ${categoriesMissing + subcategoriesMissing}`);
}

try {
  await validateImages();
} catch (error) {
  console.error('✗ Validation failed:', (error as Error).message);
  process.exit(1);
} finally {
  db.close();
}
