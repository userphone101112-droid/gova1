import { ReactNode } from 'react';
import { I18nProvider } from '../core/provider';
import { getDictionaryCached } from '../core/getDictionary';
import { getLocale } from './getLocale';
import { Feature } from '../core/types';

interface FeatureLayoutProps {
  children: ReactNode;
  feature: Feature;
}

/**
 * Create a feature-scoped layout with i18n provider
 * This is a server component that loads the dictionary and passes it to the client provider
 */
export async function createFeatureLayout({
  children,
  feature,
}: FeatureLayoutProps) {
  // Get locale from cookie or use default
  const locale = await getLocale();
  
  // Load dictionary for this feature and locale (server-side, cached)
  const dictionary = await getDictionaryCached(locale, feature);
  
  return (
    <I18nProvider
      initialLocale={locale}
      initialDictionary={dictionary}
      feature={feature}
    >
      {children}
    </I18nProvider>
  );
}
