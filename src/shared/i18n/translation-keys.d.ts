// Auto-generated translation keys
// DO NOT EDIT MANUALLY - Run: npm run i18n:generate-keys

// auth feature translations
export type authTranslationKey =
  | 'auth.login.title'
  | 'auth.login.email'
  | 'auth.login.password'
  | 'auth.login.rememberMe'
  | 'auth.login.forgotPassword'
  | 'auth.login.noAccount'
  | 'auth.login.signUp'
  | 'auth.login.emailInput'
  | 'auth.login.passwordInput'
  | 'auth.login.submitButton'
  | 'auth.register.title'
  | 'auth.register.fullName'
  | 'auth.register.email'
  | 'auth.register.password'
  | 'auth.register.confirmPassword'
  | 'auth.register.agreeTerms'
  | 'auth.register.hasAccount'
  | 'auth.register.signIn'
  | 'auth.register.emailInput'
  | 'auth.register.passwordInput'
  | 'auth.register.submitButton'
  | 'auth.forgotPassword.title'
  | 'auth.forgotPassword.email'
  | 'auth.forgotPassword.sendLink'
  | 'auth.forgotPassword.backToLogin'
;

// common feature translations
export type commonTranslationKey =
  | 'navigation.home'
  | 'navigation.dashboard'
  | 'navigation.settings'
  | 'navigation.login'
  | 'navigation.logout'
  | 'navigation.register'
  | 'buttons.submit'
  | 'buttons.cancel'
  | 'buttons.save'
  | 'buttons.delete'
  | 'buttons.edit'
  | 'buttons.close'
  | 'buttons.back'
  | 'buttons.next'
  | 'buttons.previous'
  | 'buttons.confirm'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.warning'
  | 'common.info'
  | 'common.search'
  | 'common.filter'
  | 'common.sort'
  | 'common.view'
  | 'common.actions'
  | 'common.select'
  | 'common.clear'
  | 'common.apply'
  | 'common.reset'
  | 'validation.required'
  | 'validation.invalid'
  | 'validation.email'
  | 'validation.password'
  | 'validation.minLength'
  | 'validation.maxLength'
  | 'messages.saved'
  | 'messages.deleted'
  | 'messages.updated'
  | 'messages.created'
  | 'messages.confirmDelete'
  | 'messages.noResults'
  | 'messages.somethingWentWrong'
;

// dashboard feature translations
export type dashboardTranslationKey =
  | 'dashboard.title'
  | 'dashboard.overview'
  | 'dashboard.stats.totalOrders'
  | 'dashboard.stats.totalRevenue'
  | 'dashboard.stats.activeUsers'
  | 'dashboard.stats.pendingOrders'
  | 'dashboard.recentActivity'
  | 'dashboard.quickActions'
  | 'dashboard.viewAll'
  | 'dashboard.sidebar.usersLink'
  | 'dashboard.sidebar.settingsLink'
  | 'dashboard.sidebar.analyticsLink'
;

// home feature translations
export type homeTranslationKey =
  | 'home.title'
  | 'home.subtitle'
  | 'home.welcome'
  | 'home.description'
  | 'home.cta.getStarted'
  | 'home.cta.learnMore'
  | 'home.hero.primaryButton'
  | 'home.hero.secondaryButton'
  | 'home.features.title'
  | 'home.features.quality'
  | 'home.features.fastDelivery'
  | 'home.features.support'
;

// settings feature translations
export type settingsTranslationKey =
  | 'settings.title'
  | 'settings.profile'
  | 'settings.account'
  | 'settings.preferences'
  | 'settings.security'
  | 'settings.notifications.title'
  | 'settings.notifications.emailNotifications'
  | 'settings.notifications.pushNotifications'
  | 'settings.language.title'
  | 'settings.language.currentLanguage'
  | 'settings.theme'
  | 'settings.privacy'
  | 'settings.deleteAccount'
  | 'settings.saveChanges'
;

// splash feature translations
export type splashTranslationKey =
  | 'splash.loading'
  | 'splash.initializing'
  | 'splash.complete'
  | 'splash.progress'
  | 'splash.maintenance.pinInput'
  | 'splash.maintenance.submitButton'
;


// Union type of all possible translation keys
export type AllTranslationKeys =
  | authTranslationKey
  | commonTranslationKey
  | dashboardTranslationKey
  | homeTranslationKey
  | settingsTranslationKey
  | splashTranslationKey

export type TranslationKey = AllTranslationKeys;
