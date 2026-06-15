import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/shared/i18n/core/provider";
import { getDictionaryCached } from "@/shared/i18n/core/getDictionary";
import { getLocale, getDirection } from "@/shared/i18n/utils/getLocale";

const DevUiOverlay = process.env.NODE_ENV === 'development'
  ? require('@/components/dev/DevUiOverlay').DevUiOverlay
  : null;

import { MaolProvider } from '@/providers/MaolProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inter loaded locally via next/font — avoids CSP violations from Google Fonts CDN
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoVa Marketplace",
  description: "السويس بين يديك - GoVa Marketplace Platform",
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
  
  // Load common dictionary for root layout
  const dictionary = await getDictionaryCached(locale, 'common');

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider
          initialLocale={locale}
          initialDictionary={dictionary}
          feature="common"
        >
          {children}
        </I18nProvider>
        {DevUiOverlay && <DevUiOverlay />}
        {process.env.NEXT_PUBLIC_MAOL_ENABLED === 'true' && <MaolProvider />}
      </body>
    </html>
  );
}
