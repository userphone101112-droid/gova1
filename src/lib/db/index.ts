// This file now exports JSON-based data access functions
// SQLite is only used by developers for data management
// The application uses JSON files exported from SQLite

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

// Export data access functions (async)
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

// Export types
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
