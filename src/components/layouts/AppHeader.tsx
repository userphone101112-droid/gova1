'use client';

import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { UiButton, UiLink } from '@/components/ui';
import { SHARED_LAYOUT } from '@/shared/ui-registry';
import { Menu, Search, ShoppingCart, Home, Bell, Heart, Receipt, User } from 'lucide-react';

const DESKTOP_NAV_ITEMS = [
  { key: 'home',          icon: Home,          tKey: 'navigation.home',          id: 'desktop-nav-home',          registryKey: 'HOME_LINK' },
  { key: 'notifications', icon: Bell,          tKey: 'navigation.notifications', id: 'desktop-nav-notifications', registryKey: 'NOTIFICATIONS_LINK' },
  { key: 'favorites',     icon: Heart,         tKey: 'navigation.favorites',     id: 'desktop-nav-favorites',     registryKey: 'FAVORITES_LINK' },
  { key: 'orders',        icon: Receipt,       tKey: 'navigation.orders',        id: 'desktop-nav-orders',        registryKey: 'ORDERS_LINK' },
  { key: 'profile',       icon: User,          tKey: 'navigation.profile',       id: 'desktop-nav-profile',       registryKey: 'PROFILE_LINK' },
] as const;

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
            ui={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.HOME_LINK}
            id="header-brand-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/home';
            }}
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {DESKTOP_NAV_ITEMS.map(({ key, icon: Icon, tKey, id, registryKey }) => (
            <UiLink
              key={key}
              ui={SHARED_LAYOUT.BOTTOM_NAV.ITEMS[registryKey]}
              id={id}
              href="#"
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all active:scale-95 text-sm font-semibold hover:bg-surface-container"
              style={{
                color: 'var(--gova-on-surface-variant)',
                textDecoration: 'none',
              }}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = key === 'home' ? '/home' : '#';
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{t(tKey)}</span>
            </UiLink>
          ))}
        </nav>

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
            className="w-10 h-10 flex md:hidden items-center justify-center rounded-full transition-colors active:bg-surface-container"
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
