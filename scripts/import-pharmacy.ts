import fs from 'fs';

import { db } from '../src/lib/db';
import { pharmacyCategories, pharmacySubcategories } from '../src/lib/db/schema';

const pharmListJsonPath = 'C:/Users/hesham/Desktop/suez-bazaar-devolper/shared/pharmList.json';

async function importPharmacyCategories() {
  console.log('Starting pharmacy categories import...');

  const pharmListData = JSON.parse(fs.readFileSync(pharmListJsonPath, 'utf-8'));

  for (const category of pharmListData) {
    // Insert pharmacy category
    await db.insert(pharmacyCategories).values({
      titleAr: category.title.ar,
      titleEn: category.title.en,
      icon: category.icon,
    });

    // Get the inserted category ID
    const insertedCategory = await db
      .select()
      .from(pharmacyCategories)
      .where((pharmacyCategories) => pharmacyCategories.titleEn === category.title.en);
    const categoryId = insertedCategory[0].id;

    // Insert pharmacy subcategories
    if (category.subcategories && Array.isArray(category.subcategories)) {
      for (const sub of category.subcategories) {
        await db.insert(pharmacySubcategories).values({
          pharmacyCategoryId: categoryId,
          originalId: sub.id,
          titleAr: sub.title.ar,
          titleEn: sub.title.en,
          dataFile: sub.dataFile,
          refFile: sub.refFile,
        });
      }
    }
  }

  console.log('Pharmacy categories import completed!');
}

importPharmacyCategories().catch(console.error);
