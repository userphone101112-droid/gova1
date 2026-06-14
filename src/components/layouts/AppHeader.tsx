'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { UiButton } from '@/components/ui';
import { SHARED_LAYOUT } from '@/shared/ui-registry';

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <header
      id="header-main-nav"
      className="fixed top-0 w-full z-50 shadow-sm border-b glass-effect"
      style={{ borderColor: 'var(--gova-outline-variant)' }}
    >
      <div
        className="flex justify-between items-center h-16 w-full"
        style={{ padding: '0 16px' }}
      >
        {/* Brand + Menu */}
        <div className="flex items-center gap-3">
          <UiButton
            ui={SHARED_LAYOUT.HEADER.MENU.MENU_BUTTON}
            id="header-menu-button"
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full transition-transform active:scale-90"
            aria-label={t('navigation.home')}
            style={{ color: 'var(--gova-google-blue)' }}
          >
            <span className="material-symbols-outlined">{"menu"}</span>
          </UiButton>
          <h1
            id="header-brand-title"
            className="text-lg font-bold"
            style={{ color: 'var(--gova-primary)', fontFamily: 'Inter, sans-serif' }}
          >
            {t('home.header.brandTitle')}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <UiButton
            ui={SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_BUTTON}
            id="header-search-button"
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full transition-transform active:scale-90"
            aria-label={t('navigation.search')}
            style={{ color: 'var(--gova-on-surface-variant)' }}
          >
            <span className="material-symbols-outlined">{"search"}</span>
          </UiButton>

          <UiButton
            ui={SHARED_LAYOUT.HEADER.ACTIONS.CART_BUTTON}
            id="header-cart-button"
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full relative transition-transform active:scale-90"
            aria-label={t('navigation.cart')}
            style={{ color: 'var(--gova-on-surface-variant)' }}
          >
            <span className="material-symbols-outlined">{"shopping_cart"}</span>
            <span
              id="header-cart-badge"
              className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse-gova"
              style={{ background: 'var(--gova-google-red)' }}
            />
          </UiButton>
        </div>
      </div>
    </header>
  );
}
