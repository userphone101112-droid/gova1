import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Helper function for timestamps
const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .notNull(),
};

// Categories from list.json
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  icon: text('icon').notNull(),
  image: text('image').notNull(),
  ...timestamps,
});

// Subcategories from list.json
export const subcategories = sqliteTable('subcategories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .references(() => categories.id)
    .notNull(),
  originalId: integer('original_id').notNull(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  icon: text('icon').notNull(),
  image: text('image').notNull(),
  ...timestamps,
});

// Pharmacy categories from pharmList.json
export const pharmacyCategories = sqliteTable('pharmacy_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  icon: text('icon').notNull(),
  ...timestamps,
});

// Pharmacy subcategories from pharmList.json
export const pharmacySubcategories = sqliteTable('pharmacy_subcategories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pharmacyCategoryId: integer('pharmacy_category_id')
    .references(() => pharmacyCategories.id)
    .notNull(),
  originalId: integer('original_id').notNull(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  dataFile: text('data_file').notNull(),
  refFile: text('ref_file'),
  ...timestamps,
});

// Forms from reference_data.json
export const forms = sqliteTable('forms', {
  id: text('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  ...timestamps,
});

// Strengths from reference_data.json
export const strengths = sqliteTable('strengths', {
  id: text('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  ...timestamps,
});

// Active ingredients from pharmList/*.json
export const activeIngredients = sqliteTable('active_ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pharmacySubcategoryId: integer('pharmacy_subcategory_id')
    .references(() => pharmacySubcategories.id)
    .notNull(),
  originalId: integer('original_id').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  imageUrl: text('image_url').notNull(),
  isPrescriptionRequired: integer('is_prescription_required', { mode: 'boolean' })
    .default(false)
    .notNull(),
  ...timestamps,
});

// Junction table for active ingredients and forms
export const activeIngredientForms = sqliteTable('active_ingredient_forms', {
  activeIngredientId: integer('active_ingredient_id')
    .references(() => activeIngredients.id)
    .notNull(),
  formId: text('form_id')
    .references(() => forms.id)
    .notNull(),
});

// Junction table for active ingredients and strengths
export const activeIngredientStrengths = sqliteTable('active_ingredient_strengths', {
  activeIngredientId: integer('active_ingredient_id')
    .references(() => activeIngredients.id)
    .notNull(),
  strengthId: text('strength_id')
    .references(() => strengths.id)
    .notNull(),
});

// Product brands from pharmList/*.json
export const productBrands = sqliteTable('product_brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  activeIngredientId: integer('active_ingredient_id')
    .references(() => activeIngredients.id)
    .notNull(),
  productId: integer('product_id').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  ...timestamps,
});
