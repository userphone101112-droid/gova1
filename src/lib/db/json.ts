import {
  getCategories,
  getSubcategories,
  getPharmacyCategories,
  getPharmacySubcategories,
  getForms,
  getStrengths,
  getActiveIngredients,
  getActiveIngredientForms,
  getActiveIngredientStrengths,
  getProductBrands,
  type Category,
  type Subcategory,
  type PharmacyCategory,
  type PharmacySubcategory,
  type Form,
  type Strength,
  type ActiveIngredient,
  type ActiveIngredientForm,
  type ActiveIngredientStrength,
  type ProductBrand
} from '../data/json-reader';

// Export JSON data access functions (async) for compatibility
export const categories = getCategories;
export const subcategories = getSubcategories;
export const pharmacyCategories = getPharmacyCategories;
export const pharmacySubcategories = getPharmacySubcategories;
export const forms = getForms;
export const strengths = getStrengths;
export const activeIngredients = getActiveIngredients;
export const activeIngredientForms = getActiveIngredientForms;
export const activeIngredientStrengths = getActiveIngredientStrengths;
export const productBrands = getProductBrands;

// Export JSON types for compatibility
export type {
  Category,
  Subcategory,
  PharmacyCategory,
  PharmacySubcategory,
  Form,
  Strength,
  ActiveIngredient,
  ActiveIngredientForm,
  ActiveIngredientStrength,
  ProductBrand
};
