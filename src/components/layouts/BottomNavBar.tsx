'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { UiLink } from '@/components/ui';
import { SHARED_LAYOUT } from '@/shared/ui-registry';
import { Home, Bell, Heart, Receipt, User } from 'lucide-react';

type NavItem = 'home' | 'notifications' | 'favorites' | 'orders' | 'profile';

const NAV_ITEMS = [
  { key: 'home',          icon: Home,    tKey: 'navigation.home',          id: 'nav-item-home',          registryKey: 'HOME_LINK' },
  { key: 'notifications', icon: Bell,    tKey: 'navigation.notifications', id: 'nav-item-notifications', registryKey: 'NOTIFICATIONS_LINK' },
  { key: 'favorites',     icon: Heart,   tKey: 'navigation.favorites',     id: 'nav-item-favorites',     registryKey: 'FAVORITES_LINK' },
  { key: 'orders',        icon: Receipt, tKey: 'navigation.orders',        id: 'nav-item-orders',        registryKey: 'ORDERS_LINK' },
  { key: 'profile',       icon: User,    tKey: 'navigation.profile',       id: 'nav-item-profile',       registryKey: 'PROFILE_LINK' },
] as const;

export function BottomNavBar() {
  const { t } = useTranslation();
  const [active, setActive] = useState<NavItem>('home');

  return (
    <nav
      id="bottom-navigation-bar"
      data-ui-id={SHARED_LAYOUT.BOTTOM_NAV.CONTAINER.id}
      data-ui-path={SHARED_LAYOUT.BOTTOM_NAV.CONTAINER.path}
      data-ui-feature={SHARED_LAYOUT.BOTTOM_NAV.CONTAINER.feature}
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-4 border-t rounded-t-2xl shadow-lg"
      style={{
        background: 'rgba(250,248,255,0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(195,198,213,0.40)',
      }}
    >
      {NAV_ITEMS.map(({ key, icon: Icon, tKey, id, registryKey }) => {
        const isActive = active === key;
        const isNotif = key === 'notifications';
        return (
          <UiLink
            key={key}
            ui={SHARED_LAYOUT.BOTTOM_NAV.ITEMS[registryKey]}
            id={id}
            href="#"
            className="flex flex-col items-center justify-center relative py-1 px-3 transition-transform active:scale-90"
            style={{
              color: isActive ? 'var(--gova-primary)' : 'var(--gova-on-surface-variant)',
              fontWeight: isActive ? '700' : '400',
              textDecoration: 'none',
            }}
            onClick={(e) => { e.preventDefault(); setActive(key); }}
          >
            <Icon className="w-5 h-5 transition-transform duration-200" style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }} />
            {isNotif && (
              <span
                id="nav-notif-badge"
                className="absolute top-0 right-1/2 translate-x-3 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse-gova"
                style={{ background: 'var(--gova-google-red)' }}
              />
            )}
            <span className="text-xs leading-4 font-semibold mt-0.5">{t(tKey)}</span>
            {isActive && (
              <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gova" />
            )}
          </UiLink>
        );
      })}
    </nav>
  );
}
