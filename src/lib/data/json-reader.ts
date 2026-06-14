// Types matching the database schema
export interface Category {
  id: number;
  title_ar: string;
  title_en: string;
  icon: string;
  image: string;
  created_at: number | string;
  updated_at: number | string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  original_id: number;
  title_ar: string;
  title_en: string;
  icon: string;
  image: string;
  created_at: number | string;
  updated_at: number | string;
}

export interface PharmacyCategory {
  id: number;
  title_ar: string;
  title_en: string;
  icon: string;
  created_at: number | string;
  updated_at: number | string;
}

export interface PharmacySubcategory {
  id: number;
  pharmacy_category_id: number;
  original_id: number;
  title_ar: string;
  title_en: string;
  created_at: number | string;
  updated_at: number | string;
}

export interface Form {
  id: string;
  name_ar: string;
  name_en: string;
  created_at: number | string;
  updated_at: number | string;
}

export interface Strength {
  id: string;
  value: string;
  created_at: number | string;
  updated_at: number | string;
}

export interface ActiveIngredient {
  id: number;
  pharmacy_subcategory_id: number;
  original_id: number;
  name_ar: string;
  name_en: string;
  image_url: string;
  is_prescription_required: number;
  created_at: number | string;
  updated_at: number | string;
}

export interface ActiveIngredientForm {
  active_ingredient_id: number;
  form_id: string;
}

export interface ActiveIngredientStrength {
  active_ingredient_id: number;
  strength_id: string;
}

export interface ProductBrand {
  id: number;
  active_ingredient_id: number;
  product_id: number;
  name_ar: string;
  name_en: string;
  created_at: number | string;
  updated_at: number | string;
}

// Server-side JSON Reader functions
export async function getCategories(): Promise<Category[]> {
  const data = await import('@/data/categories.json');
  return data.default as Category[];
}

export async function getSubcategories(): Promise<Subcategory[]> {
  const data = await import('@/data/subcategories.json');
  return data.default as Subcategory[];
}

export async function getPharmacyCategories(): Promise<PharmacyCategory[]> {
  const data = await import('@/data/pharmacy_categories.json');
  return data.default as PharmacyCategory[];
}

export async function getPharmacySubcategories(): Promise<PharmacySubcategory[]> {
  const data = await import('@/data/pharmacy_subcategories.json');
  return data.default as PharmacySubcategory[];
}

export async function getForms(): Promise<Form[]> {
  const data = await import('@/data/forms.json');
  return data.default as Form[];
}

export async function getStrengths(): Promise<Strength[]> {
  const data = await import('@/data/strengths.json');
  return data.default as Strength[];
}

export async function getActiveIngredients(): Promise<ActiveIngredient[]> {
  const data = await import('@/data/active_ingredients.json');
  return data.default as ActiveIngredient[];
}

export async function getActiveIngredientForms(): Promise<ActiveIngredientForm[]> {
  const data = await import('@/data/active_ingredient_forms.json');
  return data.default as ActiveIngredientForm[];
}

export async function getActiveIngredientStrengths(): Promise<ActiveIngredientStrength[]> {
  const data = await import('@/data/active_ingredient_strengths.json');
  return data.default as ActiveIngredientStrength[];
}

export async function getProductBrands(): Promise<ProductBrand[]> {
  const data = await import('@/data/product_brands.json');
  return data.default as ProductBrand[];
}
