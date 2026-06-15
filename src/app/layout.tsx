import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/shared/i18n/core/provider";
import { getDictionaryCached } from "@/shared/i18n/core/getDictionary";
import { getLocale, getDirection } from "@/shared/i18n/utils/getLocale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider
          initialLocale={locale}
          initialDictionary={dictionary}
          feature="common"
        >
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
