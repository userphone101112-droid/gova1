import { ReactNode } from 'react';
import { I18nProvider } from '@/shared/i18n/core/provider';
import { getDictionaryCached } from '@/shared/i18n/core/getDictionary';
import { getLocale, getDirection } from '@/shared/i18n/utils/getLocale';

interface HomeLayoutProps {
  children: ReactNode;
}

export default async function HomeLayout({ children }: HomeLayoutProps) {
  // Get locale from cookie or default
  const locale = await getLocale();
  const direction = getDirection(locale);
  
  // Load home dictionary for this route
  const dictionary = await getDictionaryCached(locale, 'home');

  return (
    <html lang={locale} dir={direction}>
      <body>
        <I18nProvider
          initialLocale={locale}
          initialDictionary={dictionary}
          feature="home"
        >
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
