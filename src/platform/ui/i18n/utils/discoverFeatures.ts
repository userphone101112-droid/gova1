import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Auto-discover features from filesystem
 * Scans the features directory for folders containing i18n subdirectories
 */
export function discoverFeatures(): string[] {
  const featuresPath = join(process.cwd(), 'src', 'platform', 'ui', 'i18n', 'locales');
  
  if (!existsSync(featuresPath)) {
    return ['common']; // Always include common as fallback
  }

  const features = readdirSync(featuresPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(featureName => {
      const localePath = join(featuresPath, featureName);
      return existsSync(join(localePath, 'en.json')) || existsSync(join(localePath, 'ar.json'));
    });

  // Always include common first
  return ['common', ...features];
}

/**
 * Get all available features (cached for performance)
 */
let cachedFeatures: string[] | null = null;

export function getAvailableFeatures(): string[] {
  if (cachedFeatures === null) {
    cachedFeatures = discoverFeatures();
  }
  return cachedFeatures;
}

/**
 * Check if a feature exists
 */
export function featureExists(feature: string): boolean {
  const features = getAvailableFeatures();
  return features.includes(feature);
}
