import SplashScreen from '@/components/splash/SplashScreen';
import { I18nProvider } from '@/shared/i18n/core/provider';
import { getDictionaryCached } from '@/shared/i18n/core/getDictionary';
import { getLocale } from '@/shared/i18n/utils/getLocale';

export default async function Home() {
  // Get locale from cookie or default
  const locale = await getLocale();
  
  // Load splash dictionary for this route
  const dictionary = await getDictionaryCached(locale, 'splash');

  return (
    <I18nProvider
      initialLocale={locale}
      initialDictionary={dictionary}
      feature="splash"
    >
      <SplashScreen />
    </I18nProvider>
  );
}
