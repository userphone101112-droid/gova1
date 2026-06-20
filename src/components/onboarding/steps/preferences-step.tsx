'use client';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { ONBOARDING, useTranslation } from '@/platform/ui';


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
    <div data-ui-uuid={ONBOARDING.SHELL.PREFERENCES_TITLE_CONTAINER_L32.uuid} className="w-full">
      <h1 data-ui-uuid={ONBOARDING.PREFERENCES.TITLE.uuid} className="text-3xl font-bold tracking-tight mb-2">{t(ONBOARDING.PREFERENCES.TITLE)}</h1>
      <p data-ui-uuid={ONBOARDING.PREFERENCES.DESCRIPTION.uuid} className="text-muted-foreground mb-8">{t(ONBOARDING.PREFERENCES.DESCRIPTION)}</p>

      <div data-ui-uuid={ONBOARDING.SHELL.PREFERENCES_TIMEZONE_LABEL_CONTAINER_L36.uuid} className="space-y-6 max-w-4xl mx-auto">
        <div data-ui-uuid={ONBOARDING.SHELL.PREFERENCES_TIMEZONE_LABEL_CONTAINER_L37.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.PREFERENCES.TIMEZONE_LABEL.uuid}>{t(ONBOARDING.PREFERENCES.TIMEZONE_LABEL)}</span>
          <select data-ui-uuid={ONBOARDING.PREFERENCES.TIMEZONE_SELECT.uuid} value={preferences.timezone || 'America/New_York'} onChange={(e) => updatePreferences({ timezone: e.target.value })}>
            {timezoneOptions.map((opt) => (
              <option data-ui-uuid={ONBOARDING.PREFERENCES.TIMEZONE_OPTION.uuid} data-ui-instance-id={opt.id} key={opt.id}>{t(opt.label)}</option>
            ))}
          </select>
        </div>

        <div data-ui-uuid={ONBOARDING.SHELL.PREFERENCES_NOTIFICATIONS_LABEL_CONTAINER_L46.uuid} className="space-y-2">
          <span data-ui-uuid={ONBOARDING.PREFERENCES.NOTIFICATIONS_LABEL.uuid}>{t(ONBOARDING.PREFERENCES.NOTIFICATIONS_LABEL)}</span>
          <div data-ui-uuid={ONBOARDING.SHELL.LABEL_CONTAINER_L48.uuid} className="space-y-3">
            {notificationOptions.map((option) => (
              <div data-ui-uuid={ONBOARDING.SHELL.LABEL_CONTAINER_L50.uuid} key={option.id} className="flex items-center gap-2">
                <input type="checkbox" data-ui-uuid={ONBOARDING.PREFERENCES.NOTIFICATION_CHECKBOX.uuid} data-ui-instance-id={option.id} checked={currentNotifications.includes(option.id as any)} onChange={(e) => {
        const checked = e.target.checked;
        if (checked) {
            updatePreferences({
                notifications: [...currentNotifications, option.id as any],
            });
        }
        else {
            updatePreferences({
                notifications: currentNotifications.filter((id) => id !== option.id as any),
            });
        }
    }} />
                <span data-ui-uuid={ONBOARDING.PREFERENCES.NOTIFICATION_OPTION_LABEL.uuid} data-ui-instance-id={option.id}>{t(option.label)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
