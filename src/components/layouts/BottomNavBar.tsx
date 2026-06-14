'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { UiLink } from '@/components/ui';
import { SHARED_LAYOUT } from '@/shared/ui-registry';

type NavItem = 'home' | 'notifications' | 'favorites' | 'orders' | 'profile';

const NAV_ITEMS: { key: NavItem; icon: string; tKey: string; id: string; registryKey: keyof typeof SHARED_LAYOUT.BOTTOM_NAV.ITEMS }[] = [
  { key: 'home',          icon: 'home',          tKey: 'home.nav.home',          id: 'nav-item-home',          registryKey: 'HOME_LINK' },
  { key: 'notifications', icon: 'notifications', tKey: 'home.nav.notifications', id: 'nav-item-notifications', registryKey: 'NOTIFICATIONS_LINK' },
  { key: 'favorites',     icon: 'favorite',      tKey: 'home.nav.favorites',     id: 'nav-item-favorites',     registryKey: 'FAVORITES_LINK' },
  { key: 'orders',        icon: 'receipt_long',  tKey: 'home.nav.orders',        id: 'nav-item-orders',        registryKey: 'ORDERS_LINK' },
  { key: 'profile',       icon: 'person',        tKey: 'home.nav.profile',       id: 'nav-item-profile',       registryKey: 'PROFILE_LINK' },
];

export function BottomNavBar() {
  const { t } = useTranslation();
  const [active, setActive] = useState<NavItem>('home');

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-4 glass-effect border-t rounded-t-2xl shadow-lg"
      style={{ borderColor: 'var(--gova-outline-variant)', paddingLeft: '4px', paddingRight: '4px' }}
    >
      {NAV_ITEMS.map(({ key, icon, tKey, id, registryKey }) => {
        const isActive = active === key;
        const isNotif = key === 'notifications';
        return (
          <UiLink
            key={key}
            ui={SHARED_LAYOUT.BOTTOM_NAV.ITEMS[registryKey]}
            id={id}
            href="#"
            className="flex flex-col items-center justify-center relative py-1 transition-transform active:scale-90"
            style={{
              color: isActive ? 'var(--gova-google-blue)' : 'var(--gova-on-surface-variant)',
              fontWeight: isActive ? '700' : '400',
              textDecoration: 'none',
            }}
            onClick={(e) => { e.preventDefault(); setActive(key); }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {icon}
            </span>
            {isNotif && (
              <span
                id="nav-notif-badge"
                className="absolute top-0 right-1/2 translate-x-3 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse-gova"
                style={{ background: 'var(--gova-google-red)' }}
              />
            )}
            <span className="text-xs leading-4 font-semibold mt-0.5">{t(tKey)}</span>
          </UiLink>
        );
      })}
    </nav>
  );
}
