'use client';

import { UiDiv, UiH1, UiP, UiLabel, UiSelect, UiOption, UiCheckbox, COMMON_LAYOUT, COMMON_FORMS, ONBOARDING, useTranslation } from '@/platform/ui';
import { useOnboardingStore } from '@/lib/onboarding/store';

const notificationOptions = [
  { id: 'order-notifications', label: ONBOARDING.PREFERENCES.NOTIFICATION_ORDER },
  { id: 'marketing-emails', label: ONBOARDING.PREFERENCES.NOTIFICATION_MARKETING },
  { id: 'system-updates', label: ONBOARDING.PREFERENCES.NOTIFICATION_SYSTEM },
  { id: 'weekly-report', label: ONBOARDING.PREFERENCES.NOTIFICATION_WEEKLY_REPORT },
];

const timezoneOptions = [
  { id: 'America/New_York', label: ONBOARDING.PREFERENCES.TIMEZONE_ET },
  { id: 'America/Chicago', label: ONBOARDING.PREFERENCES.TIMEZONE_CT },
  { id: 'America/Denver', label: ONBOARDING.PREFERENCES.TIMEZONE_MT },
  { id: 'America/Los_Angeles', label: ONBOARDING.PREFERENCES.TIMEZONE_PT },
  { id: 'Europe/London', label: ONBOARDING.PREFERENCES.TIMEZONE_GMT },
  { id: 'Europe/Paris', label: ONBOARDING.PREFERENCES.TIMEZONE_CET },
];

export function PreferencesStep() {
  const {
    data: { preferences },
    updatePreferences,
  } = useOnboardingStore();
  const { t } = useTranslation();

  const currentNotifications = preferences.notifications || [];

  return (
    <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-full">
      <UiH1 ui={ONBOARDING.PREFERENCES.TITLE} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.PREFERENCES.TITLE)}</UiH1>
      <UiP ui={ONBOARDING.PREFERENCES.DESCRIPTION} className="text-muted-foreground mb-8">{t(ONBOARDING.PREFERENCES.DESCRIPTION)}</UiP>

      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6 max-w-4xl mx-auto">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={COMMON_FORMS.LABEL}>{t(ONBOARDING.PREFERENCES.TIMEZONE_LABEL)}</UiLabel>
          <UiSelect
            ui={COMMON_FORMS.SELECT}
            value={preferences.timezone || 'America/New_York'}
            onChange={(e) => updatePreferences({ timezone: e.target.value })}
          >
            {timezoneOptions.map((opt) => (
              <UiOption key={opt.id} ui={COMMON_FORMS.OPTION}>{t(opt.label)}</UiOption>
            ))}
          </UiSelect>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-2">
          <UiLabel ui={COMMON_FORMS.LABEL}>{t(ONBOARDING.PREFERENCES.NOTIFICATIONS_LABEL)}</UiLabel>
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-3">
            {notificationOptions.map((option) => (
              <UiDiv key={option.id} ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2">
                <UiCheckbox
                  ui={COMMON_FORMS.CHECKBOX}
                  checked={currentNotifications.includes(option.id as any)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updatePreferences({
                        notifications: [...currentNotifications, option.id as any],
                      });
                    } else {
                      updatePreferences({
                        notifications: currentNotifications.filter((id) => id !== option.id as any),
                      });
                    }
                  }}
                />
                <UiLabel ui={COMMON_FORMS.LABEL}>{t(option.label)}</UiLabel>
              </UiDiv>
            ))}
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
