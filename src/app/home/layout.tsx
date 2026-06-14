import { ReactNode }          from 'react';
import { I18nProvider }        from '@/shared/i18n/core/provider';
import { getDictionaryCached } from '@/shared/i18n/core/getDictionary';
import { getLocale }           from '@/shared/i18n/utils/getLocale';
import { AppShell }            from '@/components/layouts/AppShell';

interface HomeLayoutProps {
  children: ReactNode;
}

export default async function HomeLayout({ children }: HomeLayoutProps) {
  const locale = await getLocale();

  // Merge home + common dictionaries so AppShell nav labels resolve correctly
  const [homeDictionary, commonDictionary] = await Promise.all([
    getDictionaryCached(locale, 'home'),
    getDictionaryCached(locale, 'common'),
  ]);

  const mergedDictionary = { ...commonDictionary, ...homeDictionary };

  return (
    <I18nProvider
      initialLocale={locale}
      initialDictionary={mergedDictionary}
      feature="home"
    >
      <AppShell>
        {children}
      </AppShell>
    </I18nProvider>
  );
}
