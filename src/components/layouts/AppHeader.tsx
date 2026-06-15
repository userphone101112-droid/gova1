'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { UiButton, UiLink } from '@/components/ui';
import { SHARED_LAYOUT } from '@/shared/ui-registry';
import { Menu, Search, ShoppingCart } from 'lucide-react';

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <header
      id="header-main-nav"
      className="fixed top-0 w-full z-50 shadow-sm border-b"
      style={{
        background: 'rgba(250,248,255,0.80)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(195,198,213,0.30)',
      }}
    >
      <div
        className="flex justify-between items-center h-16 w-full max-w-7xl mx-auto"
        style={{ padding: '0 16px' }}
      >
        {/* Brand + Menu (Mobile) */}
        <div className="flex items-center gap-3">
          <UiButton
            ui={SHARED_LAYOUT.HEADER.MENU.MENU_BUTTON}
            id="header-menu-button"
            variant="ghost"
            size="icon"
            className="w-10 h-10 flex md:hidden items-center justify-center rounded-full transition-colors active:bg-surface-container"
            aria-label={t('navigation.menu')}
            style={{ color: 'var(--gova-google-blue)' }}
          >
            <Menu className="w-5 h-5" />
          </UiButton>
          <UiLink
            ui={SHARED_LAYOUT.HEADER.BRAND.BRAND_LINK}
            id="header-brand-link"
            href="/home"
            className="font-bold transition-all active:scale-95 flex items-center"
            style={{
              color: 'var(--gova-primary)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '20px',
              lineHeight: '28px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            {t('navigation.brandTitle')}
          </UiLink>
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-2">
          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-full px-4 py-1.5 w-48 lg:w-64">
            <Search className="w-4 h-4 text-on-surface-variant/70" />
            <input
              type="text"
              placeholder={t('navigation.search') + '...'}
              className="bg-transparent border-none outline-none text-xs w-full text-on-surface placeholder-on-surface-variant/50"
            />
          </div>

          {/* Mobile Search Button */}
          <UiButton
            ui={SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_BUTTON}
            id="header-search-button"
            variant="ghost"
            size="icon"
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors active:bg-surface-container"
            aria-label={t('navigation.search')}
            style={{ color: 'var(--gova-on-surface-variant)' }}
          >
            <Search className="w-5 h-5" />
          </UiButton>

          {/* Shopping Cart */}
          <UiButton
            ui={SHARED_LAYOUT.HEADER.ACTIONS.CART_BUTTON}
            id="header-cart-button"
            variant="ghost"
            size="icon"
            className="w-10 h-10 flex items-center justify-center rounded-full relative transition-colors active:bg-surface-container"
            aria-label={t('navigation.cart')}
            style={{ color: 'var(--gova-on-surface-variant)' }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span
              id="header-cart-badge"
              className="absolute top-2 right-2 w-2 h-2 rounded-full border border-white animate-pulse-gova"
              style={{ background: 'var(--gova-google-red)' }}
            />
          </UiButton>
        </div>
      </div>
    </header>
  );
}
