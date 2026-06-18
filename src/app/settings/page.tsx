'use client';

import { Settings as SettingsIcon, Globe, Palette, Accessibility, Terminal, Database, FileText } from 'lucide-react';
import { useTranslation, UiButton, UiDiv, UiSection } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
import { SETTINGS } from '@/platform/ui/registry/features/settings';
import { useUnifiedStore } from '@/store/unified.store';

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation();
  const { themeMode, setThemeMode, fontSize, setFontSize, density, setDensity, highContrast, setHighContrast, reducedMotion, setReducedMotion, ssotGuardEnabled, setSSOTGuardEnabled } = useUnifiedStore();

  return (
    <UiDiv
      ui={COMMON_LAYOUT.CONTAINER}
      className="mx-auto w-full max-w-4xl px-4 py-6 pb-32 sm:px-6 sm:py-12 md:px-12"
    >
      {/* Header */}
      <header className="mb-12 text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary tracking-tight sm:text-5xl">
          {t(SETTINGS.TITLE)}
        </h1>
        <p className="text-base text-on-surface-variant sm:text-lg">
          {t(SETTINGS.DESCRIPTION)}
        </p>
      </header>

      {/* Section 1: Application Settings */}
      <UiSection ui={COMMON_LAYOUT.SECTION} className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.APP_SETTINGS.TITLE)}
          </h2>
        </div>
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Status Card */}
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div className="rounded-xl bg-secondary/10 p-2 text-secondary">
                  <SettingsIcon className="h-6 w-6" />
                </div>
                <div className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                  {t(SETTINGS.APP_SETTINGS.ACTIVE)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {t(SETTINGS.APP_SETTINGS.STATUS_TITLE)}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {t(SETTINGS.APP_SETTINGS.STATUS_DESCRIPTION)}
                </p>
              </div>
            </div>
          </UiDiv>

          {/* Maintenance Mode */}
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  {t(SETTINGS.APP_SETTINGS.MAINTENANCE_TITLE)}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {t(SETTINGS.APP_SETTINGS.MAINTENANCE_DESCRIPTION)}
                </p>
              </div>
              <UiButton
                ui={COMMON_LAYOUT.WRAPPER}
                variant="outline"
                className="h-8 w-14 rounded-full p-0"
              >
                <div className="h-full w-full rounded-full bg-surface-container transition-colors" />
              </UiButton>
            </div>
          </UiDiv>
        </UiDiv>

        {/* Feature Flags */}
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="rounded-3xl bg-white p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold">
            {t(SETTINGS.APP_SETTINGS.FEATURE_FLAGS_TITLE)}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/30">
              <span className="text-xs font-semibold">
                {t(SETTINGS.APP_SETTINGS.AI)}
              </span>
              <div className="h-4 w-4 rounded-full bg-secondary" />
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/30">
              <span className="text-xs font-semibold">
                {t(SETTINGS.APP_SETTINGS.ANALYTICS)}
              </span>
              <div className="h-4 w-4 rounded-full bg-outline" />
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/30">
              <span className="text-xs font-semibold">
                {t(SETTINGS.APP_SETTINGS.PDF)}
              </span>
              <div className="h-4 w-4 rounded-full bg-secondary" />
            </UiDiv>
          </div>
        </UiDiv>
      </UiSection>

      {/* Section 2: Language & Region */}
      <UiSection ui={COMMON_LAYOUT.SECTION} className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.LANGUAGE_REGION.TITLE)}
          </h2>
        </div>
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="rounded-3xl bg-white p-6 shadow-sm space-y-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {t(SETTINGS.LANGUAGE_REGION.LANGUAGE_TITLE)}
              </h3>
              <p className="text-sm text-on-surface-variant">
                {t(SETTINGS.LANGUAGE_REGION.LANGUAGE_DESCRIPTION)}
              </p>
            </div>
            <div className="flex w-fit gap-1 rounded-full bg-surface-container p-1">
              <UiButton
                ui={SETTINGS.LANGUAGE_REGION.ARABIC}
                variant={locale === 'ar' ? 'default' : 'ghost'}
                className="rounded-full px-6 py-2 text-xs font-semibold"
                onClick={() => setLocale('ar')}
              >
                {t(SETTINGS.LANGUAGE_REGION.ARABIC)}
              </UiButton>
              <UiButton
                ui={SETTINGS.LANGUAGE_REGION.ENGLISH}
                variant={locale === 'en' ? 'default' : 'ghost'}
                className="rounded-full px-6 py-2 text-xs font-semibold"
                onClick={() => setLocale('en')}
              >
                {t(SETTINGS.LANGUAGE_REGION.ENGLISH)}
              </UiButton>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 border-t border-outline-variant/20 pt-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-outline">
                {t(SETTINGS.LANGUAGE_REGION.DIRECTION_PREVIEW)}
              </h4>
              <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-4 rounded-xl bg-surface-container-low p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="text-sm">
                  {locale === 'ar'
                    ? t(SETTINGS.LANGUAGE_REGION.DIRECTION_RTL)
                    : t(SETTINGS.LANGUAGE_REGION.DIRECTION_LTR)}
                </span>
              </UiDiv>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-outline">
                {t(SETTINGS.LANGUAGE_REGION.TIMEZONE)}
              </h4>
              <select className="h-12 w-full rounded-xl bg-surface-container-low border-none px-4 text-sm focus:ring-2 focus:ring-primary">
                <option>{t(SETTINGS.LANGUAGE_REGION.CAIRO)}</option>
                <option>{t(SETTINGS.LANGUAGE_REGION.MECCA)}</option>
                <option>{t(SETTINGS.LANGUAGE_REGION.DUBAI)}</option>
              </select>
            </div>
          </div>
        </UiDiv>
      </UiSection>

      {/* Section 3: Appearance */}
      <UiSection ui={COMMON_LAYOUT.SECTION} className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Palette className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.APPEARANCE.TITLE)}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="rounded-3xl bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-semibold">
                {t(SETTINGS.APPEARANCE.THEME_TITLE)}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <UiButton
                  ui={COMMON_LAYOUT.WRAPPER}
                  variant={themeMode === 'light' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-3 rounded-2xl p-4"
                  onClick={() => setThemeMode('light')}
                >
                  <Palette className="h-8 w-8" />
                  <span className="text-xs font-semibold">
                    {t(SETTINGS.APPEARANCE.LIGHT)}
                  </span>
                </UiButton>
                <UiButton
                  ui={COMMON_LAYOUT.WRAPPER}
                  variant={themeMode === 'dark' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-3 rounded-2xl p-4"
                  onClick={() => setThemeMode('dark')}
                >
                  <Palette className="h-8 w-8" />
                  <span className="text-xs font-semibold">
                    {t(SETTINGS.APPEARANCE.DARK)}
                  </span>
                </UiButton>
                <UiButton
                  ui={COMMON_LAYOUT.WRAPPER}
                  variant={themeMode === 'system' ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-3 rounded-2xl p-4"
                  onClick={() => setThemeMode('system')}
                >
                  <Palette className="h-8 w-8" />
                  <span className="text-xs font-semibold">
                    {t(SETTINGS.APPEARANCE.SYSTEM)}
                  </span>
                </UiButton>
              </div>
            </UiDiv>
            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="rounded-3xl bg-white p-6 shadow-sm space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {t(SETTINGS.APPEARANCE.FONT_SIZE_TITLE)}
                  </h3>
                  <span className="rounded-lg bg-surface-container px-3 py-1 text-xs font-semibold">
                    {fontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-container accent-primary"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {t(SETTINGS.APPEARANCE.DENSITY_TITLE)}
                </h3>
                <div className="flex gap-4">
                  <UiButton
                    ui={COMMON_LAYOUT.WRAPPER}
                    variant={density === 'compact' ? 'default' : 'outline'}
                    className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold"
                    onClick={() => setDensity('compact')}
                  >
                    {t(SETTINGS.APPEARANCE.COMPACT)}
                  </UiButton>
                  <UiButton
                    ui={COMMON_LAYOUT.WRAPPER}
                    variant={density === 'comfortable' ? 'default' : 'outline'}
                    className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold"
                    onClick={() => setDensity('comfortable')}
                  >
                    {t(SETTINGS.APPEARANCE.COMFORTABLE)}
                  </UiButton>
                  <UiButton
                    ui={COMMON_LAYOUT.WRAPPER}
                    variant={density === 'spacious' ? 'default' : 'outline'}
                    className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold"
                    onClick={() => setDensity('spacious')}
                  >
                    {t(SETTINGS.APPEARANCE.SPACIOUS)}
                  </UiButton>
                </div>
              </div>
            </UiDiv>
          </div>
          {/* Live Preview */}
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative overflow-hidden rounded-3xl bg-primary p-6 text-white shadow-lg">
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-semibold">
                {t(SETTINGS.APPEARANCE.PREVIEW_TITLE)}
              </h3>
              <div className="space-y-3 opacity-90">
                <div className="h-4 w-3/4 rounded bg-white/20" />
                <div className="h-4 w-full rounded bg-white/20" />
                <div className="h-4 w-1/2 rounded bg-white/20" />
              </div>
              <div className="pt-4">
                <UiButton
                  ui={COMMON_LAYOUT.WRAPPER}
                  variant="default"
                  className="w-full rounded-xl bg-white py-3 font-bold text-primary active:scale-95"
                >
                  {t(SETTINGS.APPEARANCE.BUTTON)}
                </UiButton>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </UiDiv>
        </div>
      </UiSection>

      {/* Section 4: Accessibility */}
      <UiSection ui={COMMON_LAYOUT.SECTION} className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Accessibility className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.ACCESSIBILITY.TITLE)}
          </h2>
        </div>
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="divide-y divide-outline-variant/20 rounded-3xl bg-white shadow-sm">
          <div className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {t(SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_TITLE)}
              </h3>
              <p className="text-sm text-on-surface-variant">
                {t(SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_DESCRIPTION)}
              </p>
            </div>
            <UiButton
              ui={COMMON_LAYOUT.WRAPPER}
              variant="outline"
              className="h-8 w-14 rounded-full p-0"
              onClick={() => setHighContrast(!highContrast)}
            >
              <div className={`h-full w-full rounded-full transition-colors ${highContrast ? 'bg-secondary' : 'bg-surface-container'}`} />
            </UiButton>
          </div>
          <div className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {t(SETTINGS.ACCESSIBILITY.REDUCED_MOTION_TITLE)}
              </h3>
              <p className="text-sm text-on-surface-variant">
                {t(SETTINGS.ACCESSIBILITY.REDUCED_MOTION_DESCRIPTION)}
              </p>
            </div>
            <UiButton
              ui={COMMON_LAYOUT.WRAPPER}
              variant="outline"
              className="h-8 w-14 rounded-full p-0"
              onClick={() => setReducedMotion(!reducedMotion)}
            >
              <div className={`h-full w-full rounded-full transition-colors ${reducedMotion ? 'bg-secondary' : 'bg-surface-container'}`} />
            </UiButton>
          </div>
        </UiDiv>
      </UiSection>

      {/* Section 5: Developer Tools */}
      <UiSection ui={COMMON_LAYOUT.SECTION} className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Terminal className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.DEVELOPER_TOOLS.TITLE)}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="md:col-span-2 flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-error/10 p-3 text-error">
                <Terminal className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {t(SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_TITLE)}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {t(SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_DESCRIPTION)}
                </p>
              </div>
            </div>
            <UiButton
              ui={COMMON_LAYOUT.WRAPPER}
              variant="outline"
              className="h-8 w-14 rounded-full p-0"
              onClick={() => setSSOTGuardEnabled(!ssotGuardEnabled)}
            >
              <div className={`h-full w-full rounded-full transition-colors ${ssotGuardEnabled ? 'bg-secondary' : 'bg-surface-container'}`} />
            </UiButton>
          </UiDiv>
          <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-outline-variant bg-white p-6 text-center shadow-sm">
            <Terminal className="h-8 w-8 text-outline" />
            <span className="text-xs font-semibold text-on-surface-variant">
              {t(SETTINGS.DEVELOPER_TOOLS.DIAGNOSTICS)}
            </span>
            <UiButton
              ui={COMMON_LAYOUT.WRAPPER}
              variant="ghost"
              className="font-bold text-primary hover:underline"
            >
              {t(SETTINGS.DEVELOPER_TOOLS.START_TEST)}
            </UiButton>
          </UiDiv>
        </div>
      </UiSection>

      {/* Section 6: Storage & Persistence */}
      <UiSection ui={COMMON_LAYOUT.SECTION} className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Database className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.STORAGE.TITLE)}
          </h2>
        </div>
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {t(SETTINGS.STORAGE.LOCAL_STORAGE)}
                </span>
                <span className="text-xs font-semibold text-secondary">
                  {t(SETTINGS.STORAGE.USAGE)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-container">
                <div className="h-2 w-[45%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-between rounded-xl bg-surface-container-low p-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-outline" />
                <span className="text-sm">
                  {t(SETTINGS.STORAGE.COOKIES)}
                </span>
              </div>
              <UiButton
                ui={COMMON_LAYOUT.WRAPPER}
                variant="outline"
                className="rounded-lg px-4 py-2 text-xs font-semibold hover:bg-on-surface-variant"
              >
                {t(SETTINGS.STORAGE.CLEAR_ALL)}
              </UiButton>
            </div>
          </div>
        </UiDiv>
      </UiSection>

      {/* Section 7: Configuration Summary */}
      <UiSection ui={COMMON_LAYOUT.SECTION} className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.SUMMARY.TITLE)}
          </h2>
        </div>
        <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-6">
          <ul className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
            <li className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span className="text-sm text-on-surface-variant">
                {t(SETTINGS.SUMMARY.LANGUAGE)}
              </span>
              <span className="text-sm font-bold text-primary">
                {locale === 'ar'
                  ? t(SETTINGS.LANGUAGE_REGION.ARABIC)
                  : t(SETTINGS.LANGUAGE_REGION.ENGLISH)}
              </span>
            </li>
            <li className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span className="text-sm text-on-surface-variant">
                {t(SETTINGS.SUMMARY.THEME)}
              </span>
              <span className="text-sm font-bold text-primary">
                {themeMode === 'light' ? t(SETTINGS.APPEARANCE.LIGHT) : themeMode === 'dark' ? t(SETTINGS.APPEARANCE.DARK) : t(SETTINGS.APPEARANCE.SYSTEM)}
              </span>
            </li>
            <li className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span className="text-sm text-on-surface-variant">
                {t(SETTINGS.SUMMARY.DENSITY)}
              </span>
              <span className="text-sm font-bold text-primary">
                {density === 'compact' ? t(SETTINGS.APPEARANCE.COMPACT) : density === 'comfortable' ? t(SETTINGS.APPEARANCE.COMFORTABLE) : t(SETTINGS.APPEARANCE.SPACIOUS)}
              </span>
            </li>
            <li className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span className="text-sm text-on-surface-variant">
                {t(SETTINGS.SUMMARY.TIMEZONE)}
              </span>
              <span className="text-sm font-bold text-primary">
                {t(SETTINGS.LANGUAGE_REGION.CAIRO)}
              </span>
            </li>
          </ul>
        </UiDiv>
      </UiSection>

      {/* Action Buttons */}
      <footer className="flex flex-col items-center justify-center gap-4 pt-12 md:flex-row-reverse">
        <UiButton
          ui={COMMON_LAYOUT.WRAPPER}
          variant="default"
          className="w-full rounded-full px-12 py-4 font-semibold shadow-lg shadow-primary/20 active:scale-95 md:w-auto"
        >
          {t(SETTINGS.ACTIONS.SAVE)}
        </UiButton>
        <UiButton
          ui={COMMON_LAYOUT.WRAPPER}
          variant="outline"
          className="w-full rounded-full border-2 px-8 py-4 font-semibold md:w-auto"
        >
          {t(SETTINGS.ACTIONS.RESET_PREFERENCES)}
        </UiButton>
        <UiButton
          ui={COMMON_LAYOUT.WRAPPER}
          variant="ghost"
          className="w-full rounded-full py-4 font-semibold text-error hover:bg-error/5 md:w-auto"
        >
          {t(SETTINGS.ACTIONS.RESTORE_DEFAULTS)}
        </UiButton>
      </footer>
    </UiDiv>
  );
}
