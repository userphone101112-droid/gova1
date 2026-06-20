'use client';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useTranslation, SHARED_LAYOUT } from '@/platform/ui';


import { AppSidebar } from './AppSidebar';

export function AppHeader() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <>
      <h1 data-ui-uuid={SHARED_LAYOUT.HEADER.CONTAINER.uuid} id="header-main-nav" className="fixed top-0 w-full z-50 shadow-sm border-b" style={{
        background: 'var(--gova-surface)',
        borderColor: 'var(--gova-outline-variant)',
    }}>
        <div data-ui-uuid={SHARED_LAYOUT.HEADER.INNER_WRAPPER.uuid} className="flex justify-between items-center h-16 w-full max-w-7xl mx-auto" style={{ padding: '0 16px' }}>
          <div data-ui-uuid={SHARED_LAYOUT.HEADER.BRAND_SECTION.uuid} className="flex items-center gap-3">
            <button data-ui-uuid={SHARED_LAYOUT.HEADER.MENU.MENU_BUTTON.uuid} id="header-menu-button" className="w-10 h-10 flex items-center justify-center rounded-full transition-colors active:bg-surface-container" aria-label={t(SHARED_LAYOUT.HEADER.MENU.MENU_BUTTON)} style={{ color: 'var(--gova-primary)' }} onPointerDown={toggleSidebar}>
              <Menu className="w-5 h-5" />
            </button>
            <Link data-ui-uuid={SHARED_LAYOUT.HEADER.BRAND.BRAND_LINK.uuid} id="header-brand-link" href="/home" className="font-bold transition-all active:scale-95 flex items-center" style={{
        color: 'var(--gova-primary)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '20px',
        lineHeight: '28px',
        fontWeight: '600',
        textDecoration: 'none',
    }}>
              {t(SHARED_LAYOUT.HEADER.BRAND.BRAND_LINK)}
            </Link>
          </div>

          <div data-ui-uuid={SHARED_LAYOUT.HEADER.ACTIONS_SECTION.uuid} className="flex items-center gap-2">
            <div data-ui-uuid={SHARED_LAYOUT.SHELL.HEADER_BRAND_BRAND_LINK_CONTAINER_L46.uuid} className="hidden">
              <Search className="w-4 h-4 text-on-surface-variant/70" />
              <input data-ui-uuid={SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_INPUT.uuid} type="text" placeholder={`${t(SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_INPUT)}...`} className="bg-transparent border-none outline-none text-xs w-full text-on-surface placeholder-on-surface-variant/50 shadow-none h-auto px-0 py-0 focus-visible:ring-0" />
            </div>

            <button data-ui-uuid={SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_BUTTON.uuid} id="header-search-button" className="w-10 h-10 flex items-center justify-center rounded-full transition-colors active:bg-surface-container" aria-label={t(SHARED_LAYOUT.HEADER.ACTIONS.SEARCH_BUTTON)} style={{ color: 'var(--gova-on-surface-variant)' }}>
              <Search className="w-5 h-5" />
            </button>

            <button data-ui-uuid={SHARED_LAYOUT.HEADER.ACTIONS.CART_BUTTON.uuid} id="header-cart-button" className="w-10 h-10 flex items-center justify-center rounded-full relative transition-colors active:bg-surface-container" aria-label={t(SHARED_LAYOUT.HEADER.ACTIONS.CART_BUTTON)} style={{ color: 'var(--gova-on-surface-variant)' }}>
              <ShoppingCart className="w-5 h-5" />
              <div data-ui-uuid={SHARED_LAYOUT.SHELL.HEADER_BRAND_BRAND_LINK_CONTAINER_L57.uuid} id="header-cart-badge" className="absolute top-2 end-2 w-2 h-2 rounded-full border border-surface-container-lowest animate-pulse-gova" style={{ background: 'var(--gova-error)' }} />
            </button>
          </div>
        </div>
      </h1>
      <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
