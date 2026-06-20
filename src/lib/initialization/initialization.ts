import { SplashData, InitializationProgress } from '@/types/splash';

import { getRandomCategories, getRandomSubcategories } from '../images/selectors';

const INITIALIZATION_MILESTONES: InitializationProgress[] = [
  { progress: 0, status: 'جاري البدء...' },
  { progress: 25, status: 'تم تحميل الإعدادات' },
  { progress: 50, status: 'تم تحميل الفئات' },
  { progress: 75, status: 'تم تحميل بيانات الشاشة' },
  { progress: 100, status: 'التطبيق جاهز' }
];

async function loadSettings(): Promise<void> {
  // Load app settings
  // For now, this is a placeholder
  await new Promise(resolve => setTimeout(resolve, 100));
}

export async function runInitialization(
  onProgress: (progress: InitializationProgress) => void
): Promise<SplashData> {
  // Step 1: Starting
  onProgress(INITIALIZATION_MILESTONES[0]!);
  
  // Step 2: Load settings
  await loadSettings();
  onProgress(INITIALIZATION_MILESTONES[1]!);
  
  // Step 3: Load categories
  const categories = await getRandomCategories(6);
  onProgress(INITIALIZATION_MILESTONES[2]!);
  
  // Step 4: Load subcategories
  const subcategories = await getRandomSubcategories(15);
  onProgress(INITIALIZATION_MILESTONES[3]!);
  
  // Step 5: Complete
  onProgress(INITIALIZATION_MILESTONES[4]!);
  
  return { categories, subcategories };
}
