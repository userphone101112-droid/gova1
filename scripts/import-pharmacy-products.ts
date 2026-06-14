import fs from 'fs';
import path from 'path';

import { eq } from 'drizzle-orm';

import { db } from '../src/lib/db';
import {
  activeIngredients,
  activeIngredientForms,
  activeIngredientStrengths,
  productBrands,
} from '../src/lib/db/schema';
import { pharmacySubcategories } from '../src/lib/db/schema';

const pharmListPath = 'C:/Users/hesham/Desktop/suez-bazaar-devolper/shared/pharmList';

async function importPharmacyProducts() {
  console.log('Starting pharmacy products import...');

  const files = fs
    .readdirSync(pharmListPath)
    .filter((f) => f.endsWith('.json') && f !== 'reference_data.json');

  for (const file of files) {
    console.log(`Processing ${file}`);
    const filePath = path.join(pharmListPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const item of data) {
      // Find pharmacy subcategory by originalId
      const subcategory = await db
        .select()
        .from(pharmacySubcategories)
        .where(eq(pharmacySubcategories.originalId, item.category_id));

      if (subcategory.length === 0) {
        console.log(`Warning: Subcategory not found for category_id ${item.category_id}`);
        continue;
      }

      const subcategoryId = subcategory[0].id;

      // Insert active ingredient
      await db.insert(activeIngredients).values({
        pharmacySubcategoryId: subcategoryId,
        originalId: item.id[0],
        nameAr: item.name.ar,
        nameEn: item.name.en,
        imageUrl: item.image_url,
        isPrescriptionRequired: item.is_prescription_required || false,
      });

      // Get the inserted active ingredient ID
      const insertedIngredient = await db
        .select()
        .from(activeIngredients)
        .where(eq(activeIngredients.originalId, item.id[0]));
      const ingredientId = insertedIngredient[0].id;

      // Insert forms
      if (item.form_ref && Array.isArray(item.form_ref)) {
        for (const formRef of item.form_ref) {
          await db.insert(activeIngredientForms).values({
            activeIngredientId: ingredientId,
            formId: formRef,
          });
        }
      }

      // Insert strengths
      if (item.strength_ref && Array.isArray(item.strength_ref)) {
        for (const strengthRef of item.strength_ref) {
          await db.insert(activeIngredientStrengths).values({
            activeIngredientId: ingredientId,
            strengthId: strengthRef,
          });
        }
      }

      // Insert brands
      if (item.brands && Array.isArray(item.brands)) {
        for (const brand of item.brands) {
          await db.insert(productBrands).values({
            activeIngredientId: ingredientId,
            productId: brand.product_id,
            nameAr: brand.name.ar,
            nameEn: brand.name.en,
          });
        }
      }
    }
  }

  console.log('Pharmacy products import completed!');
}

importPharmacyProducts().catch(console.error);
