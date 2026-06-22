'use client';
import { Settings as SettingsIcon, Globe, Palette, Accessibility, Terminal, Database, FileText } from 'lucide-react';
import * as React from 'react';

import { calculateLocalStorageSize, formatBytes, clearAllStorage } from '@/lib/storage';
import { useTranslation } from '@/platform/ui';
import { SETTINGS } from '@/platform/ui/registry/features/settings';
import { useUnifiedStore } from '@/store/unified.store';

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation();
  const { themeMode, setThemeMode, fontSize, setFontSize, density, setDensity, highContrast, setHighContrast, reducedMotion, setReducedMotion, ssotGuardEnabled, setSSOTGuardEnabled, resetPreferences, reset, syncDOM } = useUnifiedStore();
  const [storageSize, setStorageSize] = React.useState<number>(() =>
    typeof window === 'undefined' ? 0 : calculateLocalStorageSize()
  );

  const handleClearAllStorage = async () => {
    await clearAllStorage();
    setStorageSize(0);
    window.location.reload();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-32 sm:px-6 sm:py-12 md:px-12">
      {/* Header */}
      <header className="mb-12 text-center space-y-2">
        <h1 data-ui-uuid={SETTINGS.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.TITLE.uuid}`} className="type-display-md text-primary">
          {t('settings.page.title')}
        </h1>
        <p data-ui-uuid={SETTINGS.DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.DESCRIPTION.uuid}`} className="type-body-lg text-on-surface-variant">
          {t('settings.page.description')}
        </p>
      </header>

      {/* Section 1: Application Settings */}
      <section className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.APP_SETTINGS.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.TITLE.uuid}`} className="text-xl font-semibold text-on-surface">
            {t('settings.app-settings.sectionTitle')}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Status Card */}
          <div className="settings-card">
            <div className="flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div className="rounded-xl bg-secondary/10 p-2 text-secondary">
                  <SettingsIcon className="h-6 w-6" />
                </div>
                <div data-ui-uuid={SETTINGS.APP_SETTINGS.ACTIVE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.ACTIVE.uuid}`} className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                  {t('settings.app-settings.active')}
                </div>
              </div>
              <div>
                <h3 data-ui-uuid={SETTINGS.APP_SETTINGS.STATUS_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.STATUS_TITLE.uuid}`} className="text-lg font-semibold">
                  {t('settings.app-settings.statusTitle')}
                </h3>
                <p data-ui-uuid={SETTINGS.APP_SETTINGS.STATUS_DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.STATUS_DESCRIPTION.uuid}`} className="text-sm text-on-surface-variant">
                  {t('settings.app-settings.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="settings-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 data-ui-uuid={SETTINGS.APP_SETTINGS.MAINTENANCE_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.MAINTENANCE_TITLE.uuid}`} className="text-lg font-semibold">
                  {t('settings.app-settings.maintenanceTitle')}
                </h3>
                <p data-ui-uuid={SETTINGS.APP_SETTINGS.MAINTENANCE_DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.MAINTENANCE_DESCRIPTION.uuid}`} className="text-sm text-on-surface-variant">
                  {t('settings.app-settings.maintenanceDescription')}
                </p>
              </div>
              <button className="h-8 w-14 rounded-full p-0">
                <div className="h-full w-full rounded-full bg-surface-container transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="settings-card space-y-6">
          <h3 data-ui-uuid={SETTINGS.APP_SETTINGS.FEATURE_FLAGS_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.FEATURE_FLAGS_TITLE.uuid}`} className="text-lg font-semibold">
            {t('settings.app-settings.featureFlagsTitle')}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/30">
              <span data-ui-uuid={SETTINGS.APP_SETTINGS.AI.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.AI.uuid}`} className="text-xs font-semibold">
                {t('settings.app-settings.ai')}
              </span>
              <div className="h-4 w-4 rounded-full bg-secondary" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/30">
              <span data-ui-uuid={SETTINGS.APP_SETTINGS.ANALYTICS.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.ANALYTICS.uuid}`} className="text-xs font-semibold">
                {t('settings.app-settings.analytics')}
              </span>
              <div className="h-4 w-4 rounded-full bg-outline" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/30">
              <span data-ui-uuid={SETTINGS.APP_SETTINGS.PDF.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APP_SETTINGS.PDF.uuid}`} className="text-xs font-semibold">
                {t('settings.app-settings.pdf')}
              </span>
              <div className="h-4 w-4 rounded-full bg-secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Language & Region */}
      <section className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Globe className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.LANGUAGE_REGION.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.LANGUAGE_REGION.TITLE.uuid}`} className="text-xl font-semibold text-on-surface">
            {t('settings.language-region.sectionTitle')}
          </h2>
        </div>
        <div className="settings-card space-y-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 data-ui-uuid={SETTINGS.LANGUAGE_REGION.LANGUAGE_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.LANGUAGE_REGION.LANGUAGE_TITLE.uuid}`} className="text-lg font-semibold">
                {t('settings.language-region.languageTitle')}
              </h3>
              <p data-ui-uuid={SETTINGS.LANGUAGE_REGION.LANGUAGE_DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.LANGUAGE_REGION.LANGUAGE_DESCRIPTION.uuid}`} className="text-sm text-on-surface-variant">
                {t('settings.language-region.description')}
              </p>
            </div>
            <div className="flex w-fit gap-1 rounded-full bg-surface-container p-1">
              <button data-ui-uuid={SETTINGS.LANGUAGE_REGION.ARABIC.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.LANGUAGE_REGION.ARABIC.uuid}`} className="rounded-full px-6 py-2 text-xs font-semibold" onClick={() => setLocale('ar')}>
                {t('settings.language-region.arabicButton')}
              </button>
              <button data-ui-uuid={SETTINGS.LANGUAGE_REGION.ENGLISH.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.LANGUAGE_REGION.ENGLISH.uuid}`} className="rounded-full px-6 py-2 text-xs font-semibold" onClick={() => setLocale('en')}>
                {t('settings.language-region.englishButton')}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 border-t border-outline-variant/20 pt-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 data-ui-uuid={SETTINGS.LANGUAGE_REGION.DIRECTION_PREVIEW.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.LANGUAGE_REGION.DIRECTION_PREVIEW.uuid}`} className="text-xs font-semibold text-outline">
                {t('settings.language-region.previewLabel')}
              </h4>
              <div className="flex items-center gap-4 rounded-xl bg-surface-container-low p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="text-sm">
                  {locale === 'ar'
                    ? t('settings.language-region.rtlPreview')
                    : t('settings.language-region.ltrPreview')}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 data-ui-uuid={SETTINGS.LANGUAGE_REGION.TIMEZONE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.LANGUAGE_REGION.TIMEZONE.uuid}`} className="text-xs font-semibold text-outline">
                {t('settings.language-region.timezoneLabel')}
              </h4>
              <select className="h-12 w-full rounded-xl bg-surface-container-low border-none px-4 text-sm focus:ring-2 focus:ring-primary">
                <option>{t('settings.language-region.cairo')}</option>
                <option>{t('settings.language-region.mecca')}</option>
                <option>{t('settings.language-region.dubai')}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Appearance */}
      <section className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Palette className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.APPEARANCE.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APPEARANCE.TITLE.uuid}`} className="text-xl font-semibold text-on-surface">
            {t('settings.appearance.sectionTitle')}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="settings-card space-y-6">
              <h3 data-ui-uuid={SETTINGS.APPEARANCE.THEME_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APPEARANCE.THEME_TITLE.uuid}`} className="text-lg font-semibold">
                {t('settings.appearance.themeTitle')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <button className="flex flex-col items-center gap-3 rounded-2xl p-4" onClick={() => setThemeMode('light')}>
                  <Palette className="h-8 w-8" />
                  <span data-ui-uuid={SETTINGS.APPEARANCE.LIGHT.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APPEARANCE.LIGHT.uuid}`} className="text-xs font-semibold">
                    {t('settings.appearance.light')}
                  </span>
                </button>
                <button className="flex flex-col items-center gap-3 rounded-2xl p-4" onClick={() => setThemeMode('dark')}>
                  <Palette className="h-8 w-8" />
                  <span data-ui-uuid={SETTINGS.APPEARANCE.DARK.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APPEARANCE.DARK.uuid}`} className="text-xs font-semibold">
                    {t('settings.appearance.dark')}
                  </span>
                </button>
                <button className="flex flex-col items-center gap-3 rounded-2xl p-4" onClick={() => setThemeMode('system')}>
                  <Palette className="h-8 w-8" />
                  <span data-ui-uuid={SETTINGS.APPEARANCE.SYSTEM.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APPEARANCE.SYSTEM.uuid}`} className="text-xs font-semibold">
                    {t('settings.appearance.system')}
                  </span>
                </button>
              </div>
            </div>
            <div className="settings-card space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 data-ui-uuid={SETTINGS.APPEARANCE.FONT_SIZE_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APPEARANCE.FONT_SIZE_TITLE.uuid}`} className="text-lg font-semibold">
                    {t('settings.appearance.fontSizeTitle')}
                  </h3>
                  <span className="rounded-lg bg-surface-container px-3 py-1 text-xs font-semibold">
                    {fontSize}px
                  </span>
                </div>
                <input type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-container accent-primary"
                />
              </div>
              <div className="space-y-4">
                <h3 data-ui-uuid={SETTINGS.APPEARANCE.DENSITY_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APPEARANCE.DENSITY_TITLE.uuid}`} className="text-lg font-semibold">
                  {t('settings.appearance.densityTitle')}
                </h3>
                <div className="flex gap-4">
                  <button className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold" onClick={() => setDensity('compact')}>
                    {t('settings.appearance.compact')}
                  </button>
                  <button className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold" onClick={() => setDensity('comfortable')}>
                    {t('settings.appearance.comfortable')}
                  </button>
                  <button className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold" onClick={() => setDensity('spacious')}>
                    {t('settings.appearance.spacious')}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Live Preview */}
          <div className="relative overflow-hidden settings-preview">
            <div className="relative z-10 space-y-4">
              <h3 data-ui-uuid={SETTINGS.APPEARANCE.PREVIEW_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.APPEARANCE.PREVIEW_TITLE.uuid}`} className="text-lg font-semibold">
                {t('settings.appearance.previewTitle')}
              </h3>
              <div className="space-y-3 opacity-90">
                <div className="h-4 w-3/4 rounded bg-on-primary/20" />
                <div className="h-4 w-full rounded bg-on-primary/20" />
                <div className="h-4 w-1/2 rounded bg-on-primary/20" />
              </div>
              <div className="pt-4">
                <button className="w-full rounded-xl bg-surface-container-lowest py-3 font-bold text-primary active:scale-95">
                  {t('settings.appearance.button')}
                </button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-on-primary/10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Section 4: Accessibility */}
      <section className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Accessibility className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.ACCESSIBILITY.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.ACCESSIBILITY.TITLE.uuid}`} className="text-xl font-semibold text-on-surface">
            {t('settings.accessibility.sectionTitle')}
          </h2>
        </div>
        <div className="divide-y divide-outline-variant/20 settings-card !shadow-none">
          <div className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <h3 data-ui-uuid={SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_TITLE.uuid}`} className="text-lg font-semibold">
                {t('settings.accessibility.highContrastTitle')}
              </h3>
              <p data-ui-uuid={SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_DESCRIPTION.uuid}`} className="text-sm text-on-surface-variant">
                {t('settings.accessibility.highContrastDescription')}
              </p>
            </div>
            <button className="h-8 w-14 rounded-full p-0" onClick={() => setHighContrast(!highContrast)}>
              <div className={`h-full w-full rounded-full transition-colors ${highContrast ? 'bg-secondary' : 'bg-surface-container'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <h3 data-ui-uuid={SETTINGS.ACCESSIBILITY.REDUCED_MOTION_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.ACCESSIBILITY.REDUCED_MOTION_TITLE.uuid}`} className="text-lg font-semibold">
                {t('settings.accessibility.reducedMotionTitle')}
              </h3>
              <p data-ui-uuid={SETTINGS.ACCESSIBILITY.REDUCED_MOTION_DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.ACCESSIBILITY.REDUCED_MOTION_DESCRIPTION.uuid}`} className="text-sm text-on-surface-variant">
                {t('settings.accessibility.reducedMotionDescription')}
              </p>
            </div>
            <button className="h-8 w-14 rounded-full p-0" onClick={() => setReducedMotion(!reducedMotion)}>
              <div className={`h-full w-full rounded-full transition-colors ${reducedMotion ? 'bg-secondary' : 'bg-surface-container'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Section 5: Developer Tools */}
      <section className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Terminal className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.DEVELOPER_TOOLS.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.DEVELOPER_TOOLS.TITLE.uuid}`} className="text-xl font-semibold text-on-surface">
            {t('settings.developer-tools.sectionTitle')}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 flex items-center justify-between settings-card">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-error/10 p-3 text-error">
                <Terminal className="h-6 w-6" />
              </div>
              <div>
                <h3 data-ui-uuid={SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_TITLE.uuid}`} className="text-lg font-semibold">
                  {t('settings.developer-tools.ssotGuardTitle')}
                </h3>
                <p data-ui-uuid={SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_DESCRIPTION.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_DESCRIPTION.uuid}`} className="text-sm text-on-surface-variant">
                  {t('settings.developer-tools.ssotGuardDescription')}
                </p>
              </div>
            </div>
            <button className="h-8 w-14 rounded-full p-0" onClick={() => setSSOTGuardEnabled(!ssotGuardEnabled)}>
              <div className={`h-full w-full rounded-full transition-colors ${ssotGuardEnabled ? 'bg-secondary' : 'bg-surface-container'}`} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-outline-variant bg-card p-6 text-center shadow-sm">
            <Terminal className="h-8 w-8 text-outline" />
            <span data-ui-uuid={SETTINGS.DEVELOPER_TOOLS.DIAGNOSTICS.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.DEVELOPER_TOOLS.DIAGNOSTICS.uuid}`} className="text-xs font-semibold text-on-surface-variant">
              {t('settings.developer-tools.diagnosticsLabel')}
            </span>
            <button className="font-bold text-primary hover:underline">
              {t('settings.developer-tools.button')}
            </button>
          </div>
        </div>
      </section>

      {/* Section 6: Storage & Persistence */}
      <section className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Database className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.STORAGE.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.STORAGE.TITLE.uuid}`} className="text-xl font-semibold text-on-surface">
            {t('settings.storage.sectionTitle')}
          </h2>
        </div>
        <div className="settings-card">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span data-ui-uuid={SETTINGS.STORAGE.LOCAL_STORAGE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.STORAGE.LOCAL_STORAGE.uuid}`} className="text-sm">
                  {t('settings.storage.localStorageLabel')}
                </span>
                <span className="text-xs font-semibold text-secondary">
                  {formatBytes(storageSize)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-container">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.min((storageSize / 5242880) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-between rounded-xl bg-surface-container-low p-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-outline" />
                <span data-ui-uuid={SETTINGS.STORAGE.COOKIES.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.STORAGE.COOKIES.uuid}`} className="text-sm">
                  {t('settings.storage.cookiesLabel')}
                </span>
              </div>
              <button onClick={handleClearAllStorage} className="rounded-lg px-4 py-2 text-xs font-semibold hover:bg-on-surface-variant">
                {t('settings.storage.button')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Configuration Summary */}
      <section className="mb-12 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <FileText className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.SUMMARY.TITLE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.SUMMARY.TITLE.uuid}`} className="text-xl font-semibold text-on-surface">
            {t('settings.summary.sectionTitle')}
          </h2>
        </div>
        <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-6">
          <ul className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
            <li className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span data-ui-uuid={SETTINGS.SUMMARY.LANGUAGE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.SUMMARY.LANGUAGE.uuid}`} className="text-sm text-on-surface-variant">
                {t('settings.summary.languageLabel')}
              </span>
              <span className="text-sm font-bold text-primary">
                {locale === 'ar'
                  ? t('settings.language-region.arabicButton')
                  : t('settings.language-region.englishButton')}
              </span>
            </li>
            <li className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span data-ui-uuid={SETTINGS.SUMMARY.THEME.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.SUMMARY.THEME.uuid}`} className="text-sm text-on-surface-variant">
                {t('settings.summary.themeLabel')}
              </span>
              <span className="text-sm font-bold text-primary">
                {themeMode === 'light' ? t('settings.appearance.light') : themeMode === 'dark' ? t('settings.appearance.dark') : t('settings.appearance.system')}
              </span>
            </li>
            <li className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span data-ui-uuid={SETTINGS.SUMMARY.DENSITY.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.SUMMARY.DENSITY.uuid}`} className="text-sm text-on-surface-variant">
                {t('settings.summary.densityLabel')}
              </span>
              <span className="text-sm font-bold text-primary">
                {density === 'compact' ? t('settings.appearance.compact') : density === 'comfortable' ? t('settings.appearance.comfortable') : t('settings.appearance.spacious')}
              </span>
            </li>
            <li className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span data-ui-uuid={SETTINGS.SUMMARY.TIMEZONE.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.SUMMARY.TIMEZONE.uuid}`} className="text-sm text-on-surface-variant">
                {t('settings.summary.timezoneLabel')}
              </span>
              <span data-ui-uuid={SETTINGS.LANGUAGE_REGION.CAIRO.uuid}
          data-ui-lang-uuid={`lang-${SETTINGS.LANGUAGE_REGION.CAIRO.uuid}`} className="text-sm font-bold text-primary">
                {t('settings.language-region.cairo')}
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Action Buttons */}
      <footer className="flex flex-col items-center justify-center gap-4 pt-12 md:flex-row-reverse">
        <button className="w-full rounded-full px-12 py-4 font-semibold shadow-lg shadow-primary/20 active:scale-95 md:w-auto" onClick={() => syncDOM()}>
          {t('settings.actions.saveButton')}
        </button>
        <button className="w-full rounded-full border-2 px-8 py-4 font-semibold md:w-auto" onClick={() => resetPreferences()}>
          {t('settings.actions.resetButton')}
        </button>
        <button className="w-full rounded-full py-4 font-semibold text-error hover:bg-error/5 md:w-auto" onClick={() => reset()}>
          {t('settings.actions.restoreButton')}
        </button>
      </footer>
    </div>
  );
}
