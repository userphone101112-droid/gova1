import { UiImage, UiHeader, UiDiv } from "@/components/ui";
import { useTranslation } from "@/shared/i18n/core/useTranslation";
import { SPLASH } from "@/shared/ui-registry";
import { DECORATIVE } from "@/shared/ui-registry/categories";

export default function SplashLogo() {
  const { t } = useTranslation();
  
  return (
    <UiDiv ui={DECORATIVE.SPACER} className="flex flex-col items-center gap-6 z-10 py-4">
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
    </UiDiv>
  );
}
