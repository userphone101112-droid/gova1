import { UiImage, UiHeader, UiDiv } from '@/platform/ui';
import { useTranslation } from '@/platform/ui';
import { SPLASH } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

export default function SplashLogo() {
  const { t } = useTranslation();

  return (
    <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex flex-col items-center gap-6 z-10 py-4">
      <UiImage
        ui={SPLASH.LOGO.IMAGE}
        src="/images/logo.png"
        alt={t(SPLASH.LOGO.IMAGE)}
        width={120}
        height={120}
        priority
      />
      <UiHeader
        ui={SPLASH.LOGO.HEADING}
        level={1}
        className="text-3xl font-bold text-on-primary text-center"
      >
        {t(SPLASH.LOGO.HEADING)}
      </UiHeader>
    </UiDiv>
  );
}
