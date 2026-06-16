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

  // Merge home + common + shared-layout dictionaries so AppShell nav labels resolve correctly
  const [homeDictionary, commonDictionary, sharedLayoutDictionary] = await Promise.all([
    getDictionaryCached(locale, 'home'),
    getDictionaryCached(locale, 'common'),
    getDictionaryCached(locale, 'shared-layout'),
  ]);

  const mergedDictionary = { ...commonDictionary, ...sharedLayoutDictionary, ...homeDictionary };

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
