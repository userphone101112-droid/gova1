export interface CategoryItem {
  id: number;
  titleAr: string;
  image: string;
}

export interface SubcategoryItem {
  id: number;
  titleAr: string;
  image: string;
}

export interface SplashData {
  categories: CategoryItem[];
  subcategories: SubcategoryItem[];
}

export interface InitializationProgress {
  progress: number; // 0, 25, 50, 75, 100
  status: string;
}
