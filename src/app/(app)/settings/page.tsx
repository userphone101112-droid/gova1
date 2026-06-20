'use client';
import { Settings as SettingsIcon, Globe, Palette, Accessibility, Terminal, Database, FileText } from 'lucide-react';

import { useTranslation } from '@/platform/ui';
import { SETTINGS } from '@/platform/ui/registry/features/settings';
import { useUnifiedStore } from '@/store/unified.store';

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation();
  const { themeMode, setThemeMode, fontSize, setFontSize, density, setDensity, highContrast, setHighContrast, reducedMotion, setReducedMotion, ssotGuardEnabled, setSSOTGuardEnabled, resetPreferences, reset, syncDOM } = useUnifiedStore();

  return (
    <div data-ui-uuid={SETTINGS.SHELL.TITLE_CONTAINER_L14.uuid} className="mx-auto w-full max-w-4xl px-4 py-6 pb-32 sm:px-6 sm:py-12 md:px-12">
      {/* Header */}
      <header data-ui-uuid={SETTINGS.PAGE.HEADER.uuid} className="mb-12 text-center space-y-2">
        <h1 data-ui-uuid={SETTINGS.TITLE.uuid} className="type-display-md text-primary">
          {t(SETTINGS.TITLE)}
        </h1>
        <p data-ui-uuid={SETTINGS.DESCRIPTION.uuid} className="type-body-lg text-on-surface-variant">
          {t(SETTINGS.DESCRIPTION)}
        </p>
      </header>

      {/* Section 1: Application Settings */}
      <section data-ui-uuid={SETTINGS.PAGE.APP_SETTINGS_SECTION.uuid} className="mb-12 space-y-6">
        <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_TITLE_WRAPPER_L27.uuid} className="flex items-center gap-3 px-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.APP_SETTINGS.TITLE.uuid} className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.APP_SETTINGS.TITLE)}
          </h2>
        </div>
        <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_ACTIVE_WRAPPER_L33.uuid} className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Status Card */}
          <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_ACTIVE_WRAPPER_L35.uuid} className="settings-card">
            <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_ACTIVE_WRAPPER_L36.uuid} className="flex flex-col justify-between space-y-4">
              <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_ACTIVE_WRAPPER_L37.uuid} className="flex justify-between items-start">
                <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_ACTIVE_WRAPPER_L38.uuid} className="rounded-xl bg-secondary/10 p-2 text-secondary">
                  <SettingsIcon className="h-6 w-6" />
                </div>
                <div data-ui-uuid={SETTINGS.APP_SETTINGS.ACTIVE.uuid} className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                  {t(SETTINGS.APP_SETTINGS.ACTIVE)}
                </div>
              </div>
              <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_STATUS_TITLE_WRAPPER_L45.uuid}>
                <h3 data-ui-uuid={SETTINGS.APP_SETTINGS.STATUS_TITLE.uuid} className="text-lg font-semibold">
                  {t(SETTINGS.APP_SETTINGS.STATUS_TITLE)}
                </h3>
                <p data-ui-uuid={SETTINGS.APP_SETTINGS.STATUS_DESCRIPTION.uuid} className="text-sm text-on-surface-variant">
                  {t(SETTINGS.APP_SETTINGS.STATUS_DESCRIPTION)}
                </p>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_MAINTENANCE_TITLE_WRAPPER_L57.uuid} className="settings-card">
            <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_MAINTENANCE_TITLE_WRAPPER_L58.uuid} className="flex items-center justify-between">
              <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_MAINTENANCE_TITLE_WRAPPER_L59.uuid} className="space-y-1">
                <h3 data-ui-uuid={SETTINGS.APP_SETTINGS.MAINTENANCE_TITLE.uuid} className="text-lg font-semibold">
                  {t(SETTINGS.APP_SETTINGS.MAINTENANCE_TITLE)}
                </h3>
                <p data-ui-uuid={SETTINGS.APP_SETTINGS.MAINTENANCE_DESCRIPTION.uuid} className="text-sm text-on-surface-variant">
                  {t(SETTINGS.APP_SETTINGS.MAINTENANCE_DESCRIPTION)}
                </p>
              </div>
              <button data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_MAINTENANCE_TITLE_WRAPPER_L67.uuid} className="h-8 w-14 rounded-full p-0">
                <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_MAINTENANCE_TITLE_WRAPPER_L68.uuid} className="h-full w-full rounded-full bg-surface-container transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_FEATURE_FLAGS_TITLE_WRAPPER_L75.uuid} className="settings-card space-y-6">
          <h3 data-ui-uuid={SETTINGS.APP_SETTINGS.FEATURE_FLAGS_TITLE.uuid} className="text-lg font-semibold">
            {t(SETTINGS.APP_SETTINGS.FEATURE_FLAGS_TITLE)}
          </h3>
          <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_AI_WRAPPER_L79.uuid} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_AI_WRAPPER_L80.uuid} className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/30">
              <span data-ui-uuid={SETTINGS.APP_SETTINGS.AI.uuid} className="text-xs font-semibold">
                {t(SETTINGS.APP_SETTINGS.AI)}
              </span>
              <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_AI_WRAPPER_L84.uuid} className="h-4 w-4 rounded-full bg-secondary" />
            </div>
            <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_ANALYTICS_WRAPPER_L86.uuid} className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/30">
              <span data-ui-uuid={SETTINGS.APP_SETTINGS.ANALYTICS.uuid} className="text-xs font-semibold">
                {t(SETTINGS.APP_SETTINGS.ANALYTICS)}
              </span>
              <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_ANALYTICS_WRAPPER_L90.uuid} className="h-4 w-4 rounded-full bg-outline" />
            </div>
            <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_PDF_WRAPPER_L92.uuid} className="flex items-center justify-between rounded-xl bg-surface-container p-4 border border-outline-variant/30">
              <span data-ui-uuid={SETTINGS.APP_SETTINGS.PDF.uuid} className="text-xs font-semibold">
                {t(SETTINGS.APP_SETTINGS.PDF)}
              </span>
              <div data-ui-uuid={SETTINGS.SHELL.APP_SETTINGS_PDF_WRAPPER_L96.uuid} className="h-4 w-4 rounded-full bg-secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Language & Region */}
      <section data-ui-uuid={SETTINGS.PAGE.LANGUAGE_REGION_SECTION.uuid} className="mb-12 space-y-6">
        <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_TITLE_WRAPPER_L104.uuid} className="flex items-center gap-3 px-2">
          <Globe className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.LANGUAGE_REGION.TITLE.uuid} className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.LANGUAGE_REGION.TITLE)}
          </h2>
        </div>
        <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_LANGUAGE_TITLE_WRAPPER_L110.uuid} className="settings-card space-y-8">
          <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_LANGUAGE_TITLE_WRAPPER_L111.uuid} className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_LANGUAGE_TITLE_WRAPPER_L112.uuid} className="space-y-1">
              <h3 data-ui-uuid={SETTINGS.LANGUAGE_REGION.LANGUAGE_TITLE.uuid} className="text-lg font-semibold">
                {t(SETTINGS.LANGUAGE_REGION.LANGUAGE_TITLE)}
              </h3>
              <p data-ui-uuid={SETTINGS.LANGUAGE_REGION.LANGUAGE_DESCRIPTION.uuid} className="text-sm text-on-surface-variant">
                {t(SETTINGS.LANGUAGE_REGION.LANGUAGE_DESCRIPTION)}
              </p>
            </div>
            <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_ARABIC_WRAPPER_L120.uuid} className="flex w-fit gap-1 rounded-full bg-surface-container p-1">
              <button data-ui-uuid={SETTINGS.LANGUAGE_REGION.ARABIC.uuid} className="rounded-full px-6 py-2 text-xs font-semibold" onClick={() => setLocale('ar')}>
                {t(SETTINGS.LANGUAGE_REGION.ARABIC)}
              </button>
              <button data-ui-uuid={SETTINGS.LANGUAGE_REGION.ENGLISH.uuid} className="rounded-full px-6 py-2 text-xs font-semibold" onClick={() => setLocale('en')}>
                {t(SETTINGS.LANGUAGE_REGION.ENGLISH)}
              </button>
            </div>
          </div>
          <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_DIRECTION_PREVIEW_WRAPPER_L129.uuid} className="grid grid-cols-1 gap-6 border-t border-outline-variant/20 pt-4 md:grid-cols-2">
            <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_DIRECTION_PREVIEW_WRAPPER_L130.uuid} className="space-y-3">
              <h4 data-ui-uuid={SETTINGS.LANGUAGE_REGION.DIRECTION_PREVIEW.uuid} className="text-xs font-semibold text-outline">
                {t(SETTINGS.LANGUAGE_REGION.DIRECTION_PREVIEW)}
              </h4>
              <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_DIRECTION_PREVIEW_WRAPPER_L134.uuid} className="flex items-center gap-4 rounded-xl bg-surface-container-low p-4">
                <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_DIRECTION_PREVIEW_WRAPPER_L135.uuid} className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <span data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_DIRECTION_PREVIEW_WRAPPER_L138.uuid} className="text-sm">
                  {locale === 'ar'
                    ? t(SETTINGS.LANGUAGE_REGION.DIRECTION_RTL)
                    : t(SETTINGS.LANGUAGE_REGION.DIRECTION_LTR)}
                </span>
              </div>
            </div>
            <div data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_TIMEZONE_WRAPPER_L145.uuid} className="space-y-3">
              <h4 data-ui-uuid={SETTINGS.LANGUAGE_REGION.TIMEZONE.uuid} className="text-xs font-semibold text-outline">
                {t(SETTINGS.LANGUAGE_REGION.TIMEZONE)}
              </h4>
              <select data-ui-uuid={SETTINGS.SHELL.LANGUAGE_REGION_CAIRO_WRAPPER_L149.uuid} className="h-12 w-full rounded-xl bg-surface-container-low border-none px-4 text-sm focus:ring-2 focus:ring-primary">
                <option data-ui-uuid={SETTINGS.LANGUAGE_REGION.CAIRO_OPTION.uuid}>{t(SETTINGS.LANGUAGE_REGION.CAIRO)}</option>
                <option data-ui-uuid={SETTINGS.LANGUAGE_REGION.MECCA_OPTION.uuid}>{t(SETTINGS.LANGUAGE_REGION.MECCA)}</option>
                <option data-ui-uuid={SETTINGS.LANGUAGE_REGION.DUBAI_OPTION.uuid}>{t(SETTINGS.LANGUAGE_REGION.DUBAI)}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Appearance */}
      <section data-ui-uuid={SETTINGS.PAGE.APPEARANCE_SECTION.uuid} className="mb-12 space-y-6">
        <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_TITLE_WRAPPER_L161.uuid} className="flex items-center gap-3 px-2">
          <Palette className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.APPEARANCE.TITLE.uuid} className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.APPEARANCE.TITLE)}
          </h2>
        </div>
        <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_THEME_TITLE_WRAPPER_L167.uuid} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_THEME_TITLE_WRAPPER_L168.uuid} className="lg:col-span-2 space-y-6">
            <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_THEME_TITLE_WRAPPER_L169.uuid} className="settings-card space-y-6">
              <h3 data-ui-uuid={SETTINGS.APPEARANCE.THEME_TITLE.uuid} className="text-lg font-semibold">
                {t(SETTINGS.APPEARANCE.THEME_TITLE)}
              </h3>
              <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_LIGHT_WRAPPER_L173.uuid} className="grid grid-cols-3 gap-4">
                <button data-ui-uuid={SETTINGS.SHELL.APPEARANCE_LIGHT_WRAPPER_L174.uuid} className="flex flex-col items-center gap-3 rounded-2xl p-4" onClick={() => setThemeMode('light')}>
                  <Palette className="h-8 w-8" />
                  <span data-ui-uuid={SETTINGS.APPEARANCE.LIGHT.uuid} className="text-xs font-semibold">
                    {t(SETTINGS.APPEARANCE.LIGHT)}
                  </span>
                </button>
                <button data-ui-uuid={SETTINGS.SHELL.APPEARANCE_DARK_WRAPPER_L180.uuid} className="flex flex-col items-center gap-3 rounded-2xl p-4" onClick={() => setThemeMode('dark')}>
                  <Palette className="h-8 w-8" />
                  <span data-ui-uuid={SETTINGS.APPEARANCE.DARK.uuid} className="text-xs font-semibold">
                    {t(SETTINGS.APPEARANCE.DARK)}
                  </span>
                </button>
                <button data-ui-uuid={SETTINGS.SHELL.APPEARANCE_SYSTEM_WRAPPER_L186.uuid} className="flex flex-col items-center gap-3 rounded-2xl p-4" onClick={() => setThemeMode('system')}>
                  <Palette className="h-8 w-8" />
                  <span data-ui-uuid={SETTINGS.APPEARANCE.SYSTEM.uuid} className="text-xs font-semibold">
                    {t(SETTINGS.APPEARANCE.SYSTEM)}
                  </span>
                </button>
              </div>
            </div>
            <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_FONT_SIZE_TITLE_WRAPPER_L194.uuid} className="settings-card space-y-8">
              <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_FONT_SIZE_TITLE_WRAPPER_L195.uuid} className="space-y-4">
                <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_FONT_SIZE_TITLE_WRAPPER_L196.uuid} className="flex items-center justify-between">
                  <h3 data-ui-uuid={SETTINGS.APPEARANCE.FONT_SIZE_TITLE.uuid} className="text-lg font-semibold">
                    {t(SETTINGS.APPEARANCE.FONT_SIZE_TITLE)}
                  </h3>
                  <span data-ui-uuid={SETTINGS.SHELL.APPEARANCE_FONT_SIZE_TITLE_WRAPPER_L200.uuid} className="rounded-lg bg-surface-container px-3 py-1 text-xs font-semibold">
                    {fontSize}px
                  </span>
                </div>
                <input
                  data-ui-uuid={SETTINGS.SHELL.APPEARANCE_FONT_SIZE_TITLE_WRAPPER_L205.uuid} type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-container accent-primary"
                />
              </div>
              <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_DENSITY_TITLE_WRAPPER_L213.uuid} className="space-y-4">
                <h3 data-ui-uuid={SETTINGS.APPEARANCE.DENSITY_TITLE.uuid} className="text-lg font-semibold">
                  {t(SETTINGS.APPEARANCE.DENSITY_TITLE)}
                </h3>
                <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_COMPACT_WRAPPER_L217.uuid} className="flex gap-4">
                  <button data-ui-uuid={SETTINGS.SHELL.APPEARANCE_COMPACT_WRAPPER_L218.uuid} className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold" onClick={() => setDensity('compact')}>
                    {t(SETTINGS.APPEARANCE.COMPACT)}
                  </button>
                  <button data-ui-uuid={SETTINGS.SHELL.APPEARANCE_COMFORTABLE_WRAPPER_L221.uuid} className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold" onClick={() => setDensity('comfortable')}>
                    {t(SETTINGS.APPEARANCE.COMFORTABLE)}
                  </button>
                  <button data-ui-uuid={SETTINGS.SHELL.APPEARANCE_SPACIOUS_WRAPPER_L224.uuid} className="flex-1 rounded-xl px-4 py-3 text-xs font-semibold" onClick={() => setDensity('spacious')}>
                    {t(SETTINGS.APPEARANCE.SPACIOUS)}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Live Preview */}
          <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_PREVIEW_TITLE_WRAPPER_L232.uuid} className="relative overflow-hidden settings-preview">
            <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_PREVIEW_TITLE_WRAPPER_L233.uuid} className="relative z-10 space-y-4">
              <h3 data-ui-uuid={SETTINGS.APPEARANCE.PREVIEW_TITLE.uuid} className="text-lg font-semibold">
                {t(SETTINGS.APPEARANCE.PREVIEW_TITLE)}
              </h3>
              <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_PREVIEW_TITLE_WRAPPER_L237.uuid} className="space-y-3 opacity-90">
                <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_PREVIEW_TITLE_WRAPPER_L238.uuid} className="h-4 w-3/4 rounded bg-on-primary/20" />
                <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_PREVIEW_TITLE_WRAPPER_L239.uuid} className="h-4 w-full rounded bg-on-primary/20" />
                <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_PREVIEW_TITLE_WRAPPER_L240.uuid} className="h-4 w-1/2 rounded bg-on-primary/20" />
              </div>
              <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_BUTTON_WRAPPER_L242.uuid} className="pt-4">
                <button data-ui-uuid={SETTINGS.SHELL.APPEARANCE_BUTTON_WRAPPER_L243.uuid} className="w-full rounded-xl bg-surface-container-lowest py-3 font-bold text-primary active:scale-95">
                  {t(SETTINGS.APPEARANCE.BUTTON)}
                </button>
              </div>
            </div>
            <div data-ui-uuid={SETTINGS.SHELL.APPEARANCE_PREVIEW_TITLE_WRAPPER_L248.uuid} className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-on-primary/10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Section 4: Accessibility */}
      <section data-ui-uuid={SETTINGS.PAGE.ACCESSIBILITY_SECTION.uuid} className="mb-12 space-y-6">
        <div data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_TITLE_WRAPPER_L255.uuid} className="flex items-center gap-3 px-2">
          <Accessibility className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.ACCESSIBILITY.TITLE.uuid} className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.ACCESSIBILITY.TITLE)}
          </h2>
        </div>
        <div data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_HIGH_CONTRAST_TITLE_WRAPPER_L261.uuid} className="divide-y divide-outline-variant/20 settings-card !shadow-none">
          <div data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_HIGH_CONTRAST_TITLE_WRAPPER_L262.uuid} className="flex items-center justify-between p-6">
            <div data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_HIGH_CONTRAST_TITLE_WRAPPER_L263.uuid} className="space-y-1">
              <h3 data-ui-uuid={SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_TITLE.uuid} className="text-lg font-semibold">
                {t(SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_TITLE)}
              </h3>
              <p data-ui-uuid={SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_DESCRIPTION.uuid} className="text-sm text-on-surface-variant">
                {t(SETTINGS.ACCESSIBILITY.HIGH_CONTRAST_DESCRIPTION)}
              </p>
            </div>
            <button data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_HIGH_CONTRAST_TITLE_WRAPPER_L271.uuid} className="h-8 w-14 rounded-full p-0" onClick={() => setHighContrast(!highContrast)}>
              <div data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_HIGH_CONTRAST_TITLE_WRAPPER_L272.uuid} className={`h-full w-full rounded-full transition-colors ${highContrast ? 'bg-secondary' : 'bg-surface-container'}`} />
            </button>
          </div>
          <div data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_REDUCED_MOTION_TITLE_WRAPPER_L275.uuid} className="flex items-center justify-between p-6">
            <div data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_REDUCED_MOTION_TITLE_WRAPPER_L276.uuid} className="space-y-1">
              <h3 data-ui-uuid={SETTINGS.ACCESSIBILITY.REDUCED_MOTION_TITLE.uuid} className="text-lg font-semibold">
                {t(SETTINGS.ACCESSIBILITY.REDUCED_MOTION_TITLE)}
              </h3>
              <p data-ui-uuid={SETTINGS.ACCESSIBILITY.REDUCED_MOTION_DESCRIPTION.uuid} className="text-sm text-on-surface-variant">
                {t(SETTINGS.ACCESSIBILITY.REDUCED_MOTION_DESCRIPTION)}
              </p>
            </div>
            <button data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_REDUCED_MOTION_TITLE_WRAPPER_L284.uuid} className="h-8 w-14 rounded-full p-0" onClick={() => setReducedMotion(!reducedMotion)}>
              <div data-ui-uuid={SETTINGS.SHELL.ACCESSIBILITY_REDUCED_MOTION_TITLE_WRAPPER_L285.uuid} className={`h-full w-full rounded-full transition-colors ${reducedMotion ? 'bg-secondary' : 'bg-surface-container'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Section 5: Developer Tools */}
      <section data-ui-uuid={SETTINGS.PAGE.DEVELOPER_TOOLS_SECTION.uuid} className="mb-12 space-y-6">
        <div data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_TITLE_WRAPPER_L293.uuid} className="flex items-center gap-3 px-2">
          <Terminal className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.DEVELOPER_TOOLS.TITLE.uuid} className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.DEVELOPER_TOOLS.TITLE)}
          </h2>
        </div>
        <div data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_SSOT_GUARD_TITLE_WRAPPER_L299.uuid} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_SSOT_GUARD_TITLE_WRAPPER_L300.uuid} className="md:col-span-2 flex items-center justify-between settings-card">
            <div data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_SSOT_GUARD_TITLE_WRAPPER_L301.uuid} className="flex items-center gap-4">
              <div data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_SSOT_GUARD_TITLE_WRAPPER_L302.uuid} className="rounded-xl bg-error/10 p-3 text-error">
                <Terminal className="h-6 w-6" />
              </div>
              <div data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_SSOT_GUARD_TITLE_WRAPPER_L305.uuid}>
                <h3 data-ui-uuid={SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_TITLE.uuid} className="text-lg font-semibold">
                  {t(SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_TITLE)}
                </h3>
                <p data-ui-uuid={SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_DESCRIPTION.uuid} className="text-sm text-on-surface-variant">
                  {t(SETTINGS.DEVELOPER_TOOLS.SSOT_GUARD_DESCRIPTION)}
                </p>
              </div>
            </div>
            <button data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_SSOT_GUARD_TITLE_WRAPPER_L314.uuid} className="h-8 w-14 rounded-full p-0" onClick={() => setSSOTGuardEnabled(!ssotGuardEnabled)}>
              <div data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_SSOT_GUARD_TITLE_WRAPPER_L315.uuid} className={`h-full w-full rounded-full transition-colors ${ssotGuardEnabled ? 'bg-secondary' : 'bg-surface-container'}`} />
            </button>
          </div>
          <div data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_DIAGNOSTICS_WRAPPER_L318.uuid} className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-outline-variant bg-card p-6 text-center shadow-sm">
            <Terminal className="h-8 w-8 text-outline" />
            <span data-ui-uuid={SETTINGS.DEVELOPER_TOOLS.DIAGNOSTICS.uuid} className="text-xs font-semibold text-on-surface-variant">
              {t(SETTINGS.DEVELOPER_TOOLS.DIAGNOSTICS)}
            </span>
            <button data-ui-uuid={SETTINGS.SHELL.DEVELOPER_TOOLS_START_TEST_WRAPPER_L323.uuid} className="font-bold text-primary hover:underline">
              {t(SETTINGS.DEVELOPER_TOOLS.START_TEST)}
            </button>
          </div>
        </div>
      </section>

      {/* Section 6: Storage & Persistence */}
      <section data-ui-uuid={SETTINGS.PAGE.STORAGE_SECTION.uuid} className="mb-12 space-y-6">
        <div data-ui-uuid={SETTINGS.SHELL.STORAGE_TITLE_WRAPPER_L332.uuid} className="flex items-center gap-3 px-2">
          <Database className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.STORAGE.TITLE.uuid} className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.STORAGE.TITLE)}
          </h2>
        </div>
        <div data-ui-uuid={SETTINGS.SHELL.STORAGE_LOCAL_STORAGE_WRAPPER_L338.uuid} className="settings-card">
          <div data-ui-uuid={SETTINGS.SHELL.STORAGE_LOCAL_STORAGE_WRAPPER_L339.uuid} className="flex flex-col gap-6 md:flex-row">
            <div data-ui-uuid={SETTINGS.SHELL.STORAGE_LOCAL_STORAGE_WRAPPER_L340.uuid} className="flex-1 space-y-4">
              <div data-ui-uuid={SETTINGS.SHELL.STORAGE_LOCAL_STORAGE_WRAPPER_L341.uuid} className="flex items-center justify-between">
                <span data-ui-uuid={SETTINGS.STORAGE.LOCAL_STORAGE.uuid} className="text-sm">
                  {t(SETTINGS.STORAGE.LOCAL_STORAGE)}
                </span>
                <span data-ui-uuid={SETTINGS.STORAGE.USAGE.uuid} className="text-xs font-semibold text-secondary">
                  {t(SETTINGS.STORAGE.USAGE)}
                </span>
              </div>
              <div data-ui-uuid={SETTINGS.SHELL.STORAGE_LOCAL_STORAGE_WRAPPER_L349.uuid} className="h-2 w-full rounded-full bg-surface-container">
                <div data-ui-uuid={SETTINGS.SHELL.STORAGE_LOCAL_STORAGE_WRAPPER_L350.uuid} className="h-2 w-2/5 rounded-full bg-primary" />
              </div>
            </div>
            <div data-ui-uuid={SETTINGS.SHELL.STORAGE_COOKIES_WRAPPER_L353.uuid} className="flex-1 flex items-center justify-between rounded-xl bg-surface-container-low p-4">
              <div data-ui-uuid={SETTINGS.SHELL.STORAGE_COOKIES_WRAPPER_L354.uuid} className="flex items-center gap-3">
                <Database className="h-5 w-5 text-outline" />
                <span data-ui-uuid={SETTINGS.STORAGE.COOKIES.uuid} className="text-sm">
                  {t(SETTINGS.STORAGE.COOKIES)}
                </span>
              </div>
              <button data-ui-uuid={SETTINGS.SHELL.STORAGE_CLEAR_ALL_WRAPPER_L360.uuid} className="rounded-lg px-4 py-2 text-xs font-semibold hover:bg-on-surface-variant">
                {t(SETTINGS.STORAGE.CLEAR_ALL)}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Configuration Summary */}
      <section data-ui-uuid={SETTINGS.PAGE.SUMMARY_SECTION.uuid} className="mb-12 space-y-6">
        <div data-ui-uuid={SETTINGS.SHELL.SUMMARY_TITLE_WRAPPER_L370.uuid} className="flex items-center gap-3 px-2">
          <FileText className="h-6 w-6 text-primary" />
          <h2 data-ui-uuid={SETTINGS.SUMMARY.TITLE.uuid} className="text-xl font-semibold text-on-surface">
            {t(SETTINGS.SUMMARY.TITLE)}
          </h2>
        </div>
        <div data-ui-uuid={SETTINGS.SHELL.SUMMARY_LANGUAGE_WRAPPER_L376.uuid} className="rounded-3xl bg-surface-container-lowest border border-outline-variant/30 p-6">
          <ul data-ui-uuid={SETTINGS.SHELL.SUMMARY_LANGUAGE_WRAPPER_L377.uuid} className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
            <li data-ui-uuid={SETTINGS.SHELL.SUMMARY_LANGUAGE_WRAPPER_L378.uuid} className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span data-ui-uuid={SETTINGS.SUMMARY.LANGUAGE.uuid} className="text-sm text-on-surface-variant">
                {t(SETTINGS.SUMMARY.LANGUAGE)}
              </span>
              <span data-ui-uuid={SETTINGS.SHELL.SUMMARY_LANGUAGE_WRAPPER_L382.uuid} className="text-sm font-bold text-primary">
                {locale === 'ar'
                  ? t(SETTINGS.LANGUAGE_REGION.ARABIC)
                  : t(SETTINGS.LANGUAGE_REGION.ENGLISH)}
              </span>
            </li>
            <li data-ui-uuid={SETTINGS.SHELL.SUMMARY_THEME_WRAPPER_L388.uuid} className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span data-ui-uuid={SETTINGS.SUMMARY.THEME.uuid} className="text-sm text-on-surface-variant">
                {t(SETTINGS.SUMMARY.THEME)}
              </span>
              <span data-ui-uuid={SETTINGS.SHELL.SUMMARY_THEME_WRAPPER_L392.uuid} className="text-sm font-bold text-primary">
                {themeMode === 'light' ? t(SETTINGS.APPEARANCE.LIGHT) : themeMode === 'dark' ? t(SETTINGS.APPEARANCE.DARK) : t(SETTINGS.APPEARANCE.SYSTEM)}
              </span>
            </li>
            <li data-ui-uuid={SETTINGS.SHELL.SUMMARY_DENSITY_WRAPPER_L396.uuid} className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span data-ui-uuid={SETTINGS.SUMMARY.DENSITY.uuid} className="text-sm text-on-surface-variant">
                {t(SETTINGS.SUMMARY.DENSITY)}
              </span>
              <span data-ui-uuid={SETTINGS.SHELL.SUMMARY_DENSITY_WRAPPER_L400.uuid} className="text-sm font-bold text-primary">
                {density === 'compact' ? t(SETTINGS.APPEARANCE.COMPACT) : density === 'comfortable' ? t(SETTINGS.APPEARANCE.COMFORTABLE) : t(SETTINGS.APPEARANCE.SPACIOUS)}
              </span>
            </li>
            <li data-ui-uuid={SETTINGS.SHELL.SUMMARY_TIMEZONE_WRAPPER_L404.uuid} className="flex items-center justify-between border-b border-outline-variant/10 py-2">
              <span data-ui-uuid={SETTINGS.SUMMARY.TIMEZONE.uuid} className="text-sm text-on-surface-variant">
                {t(SETTINGS.SUMMARY.TIMEZONE)}
              </span>
              <span data-ui-uuid={SETTINGS.LANGUAGE_REGION.CAIRO.uuid} className="text-sm font-bold text-primary">
                {t(SETTINGS.LANGUAGE_REGION.CAIRO)}
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Action Buttons */}
      <footer data-ui-uuid={SETTINGS.SHELL.ACTIONS_SAVE_WRAPPER_L417.uuid} className="flex flex-col items-center justify-center gap-4 pt-12 md:flex-row-reverse">
        <button data-ui-uuid={SETTINGS.SHELL.ACTIONS_SAVE_WRAPPER_L418.uuid} className="w-full rounded-full px-12 py-4 font-semibold shadow-lg shadow-primary/20 active:scale-95 md:w-auto" onClick={() => syncDOM()}>
          {t(SETTINGS.ACTIONS.SAVE)}
        </button>
        <button data-ui-uuid={SETTINGS.SHELL.ACTIONS_RESET_PREFERENCES_WRAPPER_L421.uuid} className="w-full rounded-full border-2 px-8 py-4 font-semibold md:w-auto" onClick={() => resetPreferences()}>
          {t(SETTINGS.ACTIONS.RESET_PREFERENCES)}
        </button>
        <button data-ui-uuid={SETTINGS.SHELL.ACTIONS_RESTORE_DEFAULTS_WRAPPER_L424.uuid} className="w-full rounded-full py-4 font-semibold text-error hover:bg-error/5 md:w-auto" onClick={() => reset()}>
          {t(SETTINGS.ACTIONS.RESTORE_DEFAULTS)}
        </button>
      </footer>
    </div>
  );
}
