import Image from 'next/image';

import { useTranslation, SPLASH } from '@/platform/ui';


export default function SplashLogo() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-6 z-10 py-4">
      <Image data-ui-uuid={SPLASH.LOGO.IMAGE.uuid} src="/images/logo.png" alt={t(SPLASH.LOGO.IMAGE)} width={120} height={120} priority />
      <h1 data-ui-uuid={SPLASH.LOGO.HEADING.uuid} className="text-3xl font-bold text-on-primary text-center">
        {t(SPLASH.LOGO.HEADING)}
      </h1>
    </div>
  );
}
