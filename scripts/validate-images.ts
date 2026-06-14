import { db } from '../src/lib/db';
import { categories, subcategories } from '../src/lib/db/schema';
import fs from 'fs';

async function validateImages() {
  console.log('=== Image Validation Report ===\n');

  // Validate categories
  const cats = await db.select().from(categories);
  const mainCategoriesPath = 'c:/Users/hesham/Desktop/gova/public/images/mainCategories';
  const mainCategoryFiles = fs.readdirSync(mainCategoriesPath);
  
  let categoriesMatched = 0;
  let categoriesMissing = 0;
  const missingCategories = [];

  for (const cat of cats) {
    const exists = mainCategoryFiles.includes(cat.image);
    if (exists) {
      categoriesMatched++;
    } else {
      categoriesMissing++;
      missingCategories.push(cat.image);
    }
  }

  console.log('Categories:');
  console.log(`- Total: ${cats.length}`);
  console.log(`- Matched: ${categoriesMatched}`);
  console.log(`- Missing: ${categoriesMissing}`);
  if (missingCategories.length > 0) {
    console.log('- Missing files:', missingCategories);
  }

  // Validate subcategories
  const subs = await db.select().from(subcategories);
  const subCategoriesPath = 'c:/Users/hesham/Desktop/gova/public/images/subCategories';
  const subCategoryFiles = fs.readdirSync(subCategoriesPath);
  
  let subcategoriesMatched = 0;
  let subcategoriesMissing = 0;
  const missingSubcategories = [];

  for (const sub of subs) {
    const exists = subCategoryFiles.includes(sub.image);
    if (exists) {
      subcategoriesMatched++;
    } else {
      subcategoriesMissing++;
      missingSubcategories.push(sub.image);
    }
  }

  console.log('\nSubcategories:');
  console.log(`- Total: ${subs.length}`);
  console.log(`- Matched: ${subcategoriesMatched}`);
  console.log(`- Missing: ${subcategoriesMissing}`);
  if (missingSubcategories.length > 0) {
    console.log('- Missing files:', missingSubcategories);
  }

  console.log('\n=== Summary ===');
  console.log(`Total images matched: ${categoriesMatched + subcategoriesMatched}`);
  console.log(`Total images missing: ${categoriesMissing + subcategoriesMissing}`);
}

validateImages().catch(console.error);
