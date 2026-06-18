'use client';

import { useEffect } from 'react';
import {
  Globe,
  Sun,
  Moon,
  Monitor,
  LayoutGrid,
  Wrench,
  RotateCcw,
} from 'lucide-react';
import { useTranslation, UiButton, UiDiv, SETTINGS } from '@/platform/ui';
import type { UiIdentity } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
import { useGlobalSSOTStore } from '@/store/global-ssot.store';
import { useSettingsStore } from '@/store/settings.store';
import type { FeatureFlagKey, FeatureFlags } from '../../../config/settings.schema';
import {
  SettingsGroup,
  SettingsRow,
  SettingsSwitch,
  SettingsSegmented,
  SettingsSlider,
  SettingsBadge,
} from './SettingsControls';

const FEATURE_FLAG_KEYS: FeatureFlagKey[] = [
  'darkMode',
  'multiLanguage',
  'advancedSearch',
  'exportData',
  'importData',
  'experimentalUI',
  'betaFeatures',
  'socialSharing',
  'offlineMode',
];

const FEATURE_FLAG_UI: Record<FeatureFlagKey, UiIdentity> = {
  darkMode: SETTINGS.FEATURES.DARK_MODE,
  multiLanguage: SETTINGS.FEATURES.MULTI_LANGUAGE,
  advancedSearch: SETTINGS.FEATURES.ADVANCED_SEARCH,
  exportData: SETTINGS.FEATURES.EXPORT_DATA,
  importData: SETTINGS.FEATURES.IMPORT_DATA,
  experimentalUI: SETTINGS.FEATURES.EXPERIMENTAL_UI,
  betaFeatures: SETTINGS.FEATURES.BETA_FEATURES,
  socialSharing: SETTINGS.FEATURES.SOCIAL_SHARING,
  offlineMode: SETTINGS.FEATURES.OFFLINE_MODE,
};

export function SettingsPage() {
  const { locale, setLocale, t } = useTranslation();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const {
    themeMode,
    fontSize,
    density,
    highContrast,
    reducedMotion,
    setThemeMode,
    setFontSize,
    setDensity,
    setHighContrast,
    setReducedMotion,
    resetPreferences,
  } = useGlobalSSOTStore();

  const { features, setFeature, settings, setSettings, maintenanceBypassed, setMaintenanceBypass } =
    useSettingsStore();

  useEffect(() => {
    if (!features.darkMode && themeMode !== 'light') {
      setThemeMode('light');
    }
  }, [features.darkMode, themeMode, setThemeMode]);

  const handleLanguageChange = async (newLang: 'en' | 'ar') => {
    await setLocale(newLang);
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    if (!features.darkMode && mode !== 'light') return;
    setThemeMode(mode);
  };

  const handleReset = async () => {
    resetPreferences();
    await setLocale('en');
  };

  return (
    <UiDiv
      ui={COMMON_LAYOUT.CONTAINER}
      className="mx-auto w-full max-w-lg px-3 py-4 pb-24 sm:max-w-xl sm:px-4 sm:py-6 md:max-w-2xl md:px-6 md:pb-8"
    >
      <header className="mb-6 space-y-2 sm:mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
          <Wrench className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
          {t(SETTINGS.PAGE.TITLE)}
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-on-surface-variant">
          {t(SETTINGS.PAGE.DESCRIPTION)}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-5 sm:space-y-6">
          <SettingsGroup title={t(SETTINGS.LANGUAGE.TITLE)}>
            <div className="space-y-1 px-3 py-3.5 sm:px-4 sm:py-4">
              <p className="text-xs text-on-surface-variant">{t(SETTINGS.LANGUAGE.DESCRIPTION)}</p>
              <SettingsSegmented
                fullWidth
                value={locale}
                onChange={handleLanguageChange}
                options={[
                  {
                    value: 'en',
                    label: t(SETTINGS.OPTIONS.ENGLISH),
                    icon: <Globe className="h-3.5 w-3.5 shrink-0" />,
                  },
                  {
                    value: 'ar',
                    label: t(SETTINGS.OPTIONS.ARABIC),
                    icon: <Globe className="h-3.5 w-3.5 shrink-0" />,
                  },
                ]}
              />
            </div>
            <SettingsRow
              label={t(SETTINGS.DIRECTION.TITLE)}
              description={t(SETTINGS.DIRECTION.DESCRIPTION)}
              bordered={false}
            >
              <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                <SettingsBadge>{direction}</SettingsBadge>
                <span className="text-[10px] text-on-surface-variant sm:text-end">
                  {direction === 'rtl'
                    ? t(SETTINGS.DIRECTION.RTL)
                    : t(SETTINGS.DIRECTION.LTR)}
                </span>
              </div>
            </SettingsRow>
          </SettingsGroup>

          <SettingsGroup title={t(SETTINGS.THEME.TITLE)}>
            <div className="space-y-1 px-3 py-3.5 sm:px-4 sm:py-4">
              <p className="text-xs text-on-surface-variant">{t(SETTINGS.THEME.DESCRIPTION)}</p>
              <SettingsSegmented
                fullWidth
                value={themeMode}
                onChange={handleThemeChange}
                options={[
                  {
                    value: 'light',
                    label: t(SETTINGS.OPTIONS.LIGHT),
                    icon: <Sun className="h-3.5 w-3.5 shrink-0" />,
                  },
                  {
                    value: 'dark',
                    label: t(SETTINGS.OPTIONS.DARK),
                    icon: <Moon className="h-3.5 w-3.5 shrink-0" />,
                    disabled: !features.darkMode,
                  },
                  {
                    value: 'system',
                    label: t(SETTINGS.OPTIONS.SYSTEM),
                    icon: <Monitor className="h-3.5 w-3.5 shrink-0" />,
                    disabled: !features.darkMode,
                  },
                ]}
              />
            </div>
          </SettingsGroup>

          <SettingsGroup title={t(SETTINGS.DISPLAY.TITLE)}>
            <SettingsSlider
              label={t(SETTINGS.DISPLAY.FONT_SIZE)}
              value={fontSize}
              min={12}
              max={22}
              unit="px"
              onChange={setFontSize}
            />
            <div className="border-t border-outline-variant/50 px-3 py-3.5 sm:px-4 sm:py-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-on-surface">
                <LayoutGrid className="h-4 w-4 shrink-0 text-on-surface-variant" />
                {t(SETTINGS.DISPLAY.DENSITY)}
              </div>
              <SettingsSegmented
                fullWidth
                value={density}
                onChange={setDensity}
                options={[
                  { value: 'compact', label: t(SETTINGS.OPTIONS.DENSITY_COMPACT) },
                  { value: 'comfortable', label: t(SETTINGS.OPTIONS.DENSITY_COMFORTABLE) },
                  { value: 'spacious', label: t(SETTINGS.OPTIONS.DENSITY_SPACIOUS) },
                ]}
              />
            </div>
          </SettingsGroup>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <SettingsGroup title={t(SETTINGS.ACCESSIBILITY.TITLE)}>
            <SettingsRow label={t(SETTINGS.ACCESSIBILITY.HIGH_CONTRAST)} bordered>
              <SettingsSwitch
                label={t(SETTINGS.ACCESSIBILITY.HIGH_CONTRAST)}
                checked={highContrast}
                onChange={setHighContrast}
              />
            </SettingsRow>
            <SettingsRow label={t(SETTINGS.ACCESSIBILITY.REDUCED_MOTION)} bordered={false}>
              <SettingsSwitch
                label={t(SETTINGS.ACCESSIBILITY.REDUCED_MOTION)}
                checked={reducedMotion}
                onChange={setReducedMotion}
              />
            </SettingsRow>
          </SettingsGroup>

          <SettingsGroup title={t(SETTINGS.FEATURES.TITLE)}>
            {FEATURE_FLAG_KEYS.map((key, index) => (
              <SettingsRow
                key={key}
                label={t(FEATURE_FLAG_UI[key])}
                bordered={index < FEATURE_FLAG_KEYS.length - 1}
              >
                <SettingsSwitch
                  label={t(FEATURE_FLAG_UI[key])}
                  checked={features[key as keyof FeatureFlags]}
                  onChange={(value) => setFeature(key, value)}
                />
              </SettingsRow>
            ))}
          </SettingsGroup>

          <SettingsGroup title={t(SETTINGS.MAINTENANCE.TITLE)}>
            <SettingsRow label={t(SETTINGS.MAINTENANCE.ENABLED)} bordered>
              <SettingsSwitch
                label={t(SETTINGS.MAINTENANCE.ENABLED)}
                checked={settings.maintenance.enabled}
                onChange={(enabled) =>
                  setSettings({ maintenance: { ...settings.maintenance, enabled } })
                }
              />
            </SettingsRow>
            <SettingsRow label={t(SETTINGS.MAINTENANCE.BYPASSED)} bordered={false}>
              <SettingsSwitch
                label={t(SETTINGS.MAINTENANCE.BYPASSED)}
                checked={maintenanceBypassed}
                onChange={setMaintenanceBypass}
              />
            </SettingsRow>
          </SettingsGroup>
        </div>

        <div className="lg:col-span-2">
          <UiButton
            ui={SETTINGS.ACTIONS.RESET}
            variant="outline"
            className="h-11 w-full gap-2 rounded-xl border-outline-variant text-sm font-medium sm:h-12 lg:max-w-md"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            {t(SETTINGS.ACTIONS.RESET)}
          </UiButton>
        </div>
      </div>
    </UiDiv>
  );
}
