import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/platform/ui";
import { getAppDictionaryCached } from "@/platform/ui/server";
import { getLocale, getDirection, getThemeMode, getEffectiveTheme, getSSOTPreferences } from "@/platform/ui/server";
import { SSOTProvider } from "@/providers/SSOTProvider";
import { SSOTGuard } from "@/components/shared/SSOTGuard";
import { LocaleProvider } from "@/platform/ui";

const DevUiOverlay = process.env.NODE_ENV === 'development'
  ? require('@/platform/ui').DevUiOverlay
  : null;

import { MaolProvider } from '@/providers/MaolProvider';

// Inter loaded locally via next/font — avoids CSP violations from Google Fonts CDN
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoVa Marketplace",
  description: "السويس بين يديك - GoVa Marketplace Platform",
  metadataBase: new URL('http://localhost:3001'),
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "GoVa Marketplace",
    description: "السويس بين يديك - GoVa Marketplace Platform",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "GoVa Logo",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie or default
  const locale = await getLocale();
  const direction = getDirection(locale);
  const themeMode = await getThemeMode();
  const effectiveTheme = getEffectiveTheme(themeMode);
  const ssotPreferences = await getSSOTPreferences();
  
  const dictionary = await getAppDictionaryCached(locale);

  const htmlClassName = [
    inter.variable,
    notoSansArabic.variable,
    'h-full antialiased',
    effectiveTheme,
    ssotPreferences.highContrast ? 'high-contrast' : '',
    ssotPreferences.reducedMotion ? 'reduce-motion' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <html
      lang={locale}
      dir={direction}
      data-theme={effectiveTheme}
      data-density={ssotPreferences.density}
      className={htmlClassName}
      style={{ fontSize: `${ssotPreferences.fontSize}px` }}
    >
      <body className="min-h-full flex flex-col">
        <SSOTProvider
          snapshot={{
            language: locale,
            themeMode,
            fontSize: ssotPreferences.fontSize,
            density: ssotPreferences.density,
            highContrast: ssotPreferences.highContrast,
            reducedMotion: ssotPreferences.reducedMotion,
          }}
        >
          <LocaleProvider initialLocale={locale} initialDirection={direction} />
          <I18nProvider
            initialLocale={locale}
            initialDictionary={dictionary}
          >
            {children}
            {DevUiOverlay && <DevUiOverlay />}
          </I18nProvider>
        </SSOTProvider>
        {process.env.NEXT_PUBLIC_MAOL_ENABLED === 'true' && <MaolProvider />}
        <SSOTGuard />
      </body>
    </html>
  );
}
