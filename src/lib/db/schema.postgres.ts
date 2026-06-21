import { sql } from 'drizzle-orm';
import { pgTable, text, integer, timestamp, serial, varchar, boolean } from 'drizzle-orm/pg-core';

// Helper function for timestamps
const timestamps = {
  createdAt: timestamp('created_at', { mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
};

// Categories from list.json
export const categories = pgTable('categories', {
  id: integer('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  icon: text('icon').notNull(),
  image: text('image').notNull(),
  ...timestamps,
});

// Subcategories from list.json
export const subcategories = pgTable('subcategories', {
  id: serial('id').primaryKey(),
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
export const pharmacyCategories = pgTable('pharmacy_categories', {
  id: serial('id').primaryKey(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').notNull(),
  icon: text('icon').notNull(),
  ...timestamps,
});

// Pharmacy subcategories from pharmList.json
export const pharmacySubcategories = pgTable('pharmacy_subcategories', {
  id: serial('id').primaryKey(),
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
export const forms = pgTable('forms', {
  id: varchar('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  ...timestamps,
});

// Strengths from reference_data.json
export const strengths = pgTable('strengths', {
  id: varchar('id').primaryKey(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  ...timestamps,
});

// Active ingredients from pharmList/*.json
export const activeIngredients = pgTable('active_ingredients', {
  id: serial('id').primaryKey(),
  pharmacySubcategoryId: integer('pharmacy_subcategory_id')
    .references(() => pharmacySubcategories.id)
    .notNull(),
  originalId: integer('original_id').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  imageUrl: text('image_url').notNull(),
  isPrescriptionRequired: boolean('is_prescription_required')
    .default(false)
    .notNull(),
  ...timestamps,
});

// Junction table for active ingredients and forms
export const activeIngredientForms = pgTable('active_ingredient_forms', {
  activeIngredientId: integer('active_ingredient_id')
    .references(() => activeIngredients.id)
    .notNull(),
  formId: varchar('form_id')
    .references(() => forms.id)
    .notNull(),
});

// Junction table for active ingredients and strengths
export const activeIngredientStrengths = pgTable('active_ingredient_strengths', {
  activeIngredientId: integer('active_ingredient_id')
    .references(() => activeIngredients.id)
    .notNull(),
  strengthId: varchar('strength_id')
    .references(() => strengths.id)
    .notNull(),
});

// Product brands from pharmList/*.json
export const productBrands = pgTable('product_brands', {
  id: serial('id').primaryKey(),
  activeIngredientId: integer('active_ingredient_id')
    .references(() => activeIngredients.id)
    .notNull(),
  productId: integer('product_id').notNull(),
  nameAr: text('name_ar').notNull(),
  nameEn: text('name_en').notNull(),
  ...timestamps,
});
