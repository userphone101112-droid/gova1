import fs from 'fs';

import { db } from '../src/lib/db';
import { categories, subcategories } from '../src/lib/db/schema';

const listJsonPath = 'C:/Users/hesham/Desktop/suez-bazaar-devolper/shared/list.json';

async function importCategories() {
  console.log('Starting categories import...');

  const listData = JSON.parse(fs.readFileSync(listJsonPath, 'utf-8'));

  for (const category of listData) {
    // Insert category
    await db.insert(categories).values({
      id: category.id,
      titleAr: category.title.ar,
      titleEn: category.title.en,
      icon: category.icon,
      image: category.image,
    });

    // Insert subcategories
    if (category.subcategories && Array.isArray(category.subcategories)) {
      for (const sub of category.subcategories) {
        await db.insert(subcategories).values({
          categoryId: category.id,
          originalId: sub.id,
          titleAr: sub.title.ar,
          titleEn: sub.title.en,
          icon: sub.icon,
          image: sub.image,
        });
      }
    }
  }

  console.log('Categories import completed!');
}

importCategories().catch(console.error);
