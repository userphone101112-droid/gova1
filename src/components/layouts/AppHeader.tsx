'use client';

import { useState } from 'react';
import { useTranslation } from '@/platform/ui';
import { UiButton, UiInput, UiLink, UiHeader, UiDiv } from '@/platform/ui';
import { SHARED_LAYOUT } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import { AppSidebar } from './AppSidebar';

export function AppHeader() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <UiHeader
        ui={SHARED_LAYOUT.HEADER.CONTAINER}
        id="header-main-nav"
        className="fixed top-0 w-full z-50 shadow-sm border-b"
        style={{
          background: 'rgba(250,248,255,0.80)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(195,198,213,0.30)',
        }}
      >
        <UiDiv
          ui={SHARED_LAYOUT.HEADER.INNER_WRAPPER}
          className="flex justify-between items-center h-16 w-full max-w-7xl mx-auto"
          style={{ padding: '0 16px' }}
        >
          <UiDiv
            ui={SHARED_LAYOUT.HEADER.BRAND_SECTION}
            className="flex items-center gap-3"
          >
            <UiButton
              ui={SHARED_LAYOUT.HEADER.MENU.MENU_BUTTON}
              id="header-menu-button"
              variant="ghost"
              size="icon"
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors active:bg-surface-container"
              aria-label={t(SHARED_LAYOUT.HEADER.MENU.MENU_BUTTON)}
              style={{ color: 'var(--gova-google-blue)' }}
              onClick={() => setIsSidebarOpen(true)}
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
              {t(SHARED_LAYOUT.HEADER.BRAND.BRAND_LINK)}
            </UiLink>
          </UiDiv>

          <UiDiv
            ui={SHARED_LAYOUT.HEADER.ACTIONS_SECTION}
            className="flex items-center gap-2"
          >
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="hidden">
              <Search className="w-4 h-4 text-on-surface-variant/70" />
              <UiInput
                ui={SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_INPUT}
                type="text"
                placeholder={`${t(SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_INPUT)}...`}
                className="bg-transparent border-none outline-none text-xs w-full text-on-surface placeholder-on-surface-variant/50 shadow-none h-auto px-0 py-0 focus-visible:ring-0"
              />
            </UiDiv>

            <UiButton
              ui={SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_BUTTON}
              id="header-search-button"
              variant="ghost"
              size="icon"
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors active:bg-surface-container"
              aria-label={t(SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_BUTTON)}
              style={{ color: 'var(--gova-on-surface-variant)' }}
            >
              <Search className="w-5 h-5" />
            </UiButton>

            <UiButton
              ui={SHARED_LAYOUT.HEADER.ACTIONS.CART_BUTTON}
              id="header-cart-button"
              variant="ghost"
              size="icon"
              className="w-10 h-10 flex items-center justify-center rounded-full relative transition-colors active:bg-surface-container"
              aria-label={t(SHARED_LAYOUT.HEADER.ACTIONS.CART_BUTTON)}
              style={{ color: 'var(--gova-on-surface-variant)' }}
            >
              <ShoppingCart className="w-5 h-5" />
              <UiDiv ui={COMMON_LAYOUT.CONTAINER}
                id="header-cart-badge"
                className="absolute top-2 end-2 w-2 h-2 rounded-full border border-white animate-pulse-gova"
                style={{ background: 'var(--gova-google-red)' }}
              />
            </UiButton>
          </UiDiv>
        </UiDiv>
      </UiHeader>
      <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
