'use client';

import { useEffect, useState } from 'react';
import { runInitialization } from '@/lib/initialization/initialization';
import { SplashData } from '@/types/splash';
import SplashLogo from './SplashLogo';
import TopMarquee from './TopMarquee';
import BottomRibbons from './BottomRibbons';
import SplashInitializer from './SplashInitializer';

export default function SplashScreen() {
  const [data, setData] = useState<SplashData | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const splashData = await runInitialization(() => {});
      setData(splashData);
    };

    initialize();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <SplashLogo />
        <SplashInitializer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex flex-col items-center justify-between py-8">
      <TopMarquee categories={data.categories} />
      <SplashLogo />
      <SplashInitializer />
      <BottomRibbons subcategories={data.subcategories} />
    </div>
  );
}
