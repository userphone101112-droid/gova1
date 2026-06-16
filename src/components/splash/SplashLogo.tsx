import { UiImage, UiHeader } from "@/components/ui";
import { useTranslation } from "@/shared/i18n/core/useTranslation";
import { SPLASH } from "@/shared/ui-registry";

export default function SplashLogo() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center gap-6 z-10 py-4">
      <UiImage
        ui={SPLASH.LOGO.IMAGE}
        src="/images/logo.png"
        alt={t('splash.logo.logoImage')}
        width={120}
        height={120}
        priority
      />
      <UiHeader
        ui={SPLASH.LOGO.HEADING}
        level={1}
        className="text-3xl font-bold text-white text-center"
      >
        {t('splash.logo.heading')}
      </UiHeader>
    </div>
  );
}
