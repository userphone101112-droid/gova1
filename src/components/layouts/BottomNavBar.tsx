'use client';

import { useState } from 'react';
import { useTranslation } from '@/platform/ui';
import { UiLink, UiNav, UiDiv } from '@/platform/ui';
import { SHARED_LAYOUT } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';
import { Home, Bell, Heart, Receipt, User } from 'lucide-react';

type NavItem = 'home' | 'notifications' | 'favorites' | 'orders' | 'profile';

const NAV_ITEMS = [
  { key: 'home' as const, icon: Home, ui: SHARED_LAYOUT.BOTTOM_NAV.ITEMS.HOME_LINK, id: 'nav-item-home', href: '/home' },
  { key: 'notifications' as const, icon: Bell, ui: SHARED_LAYOUT.BOTTOM_NAV.ITEMS.NOTIFICATIONS_LINK, id: 'nav-item-notifications', href: '/notifications' },
  { key: 'favorites' as const, icon: Heart, ui: SHARED_LAYOUT.BOTTOM_NAV.ITEMS.FAVORITES_LINK, id: 'nav-item-favorites', href: '/favorites' },
  { key: 'orders' as const, icon: Receipt, ui: SHARED_LAYOUT.BOTTOM_NAV.ITEMS.ORDERS_LINK, id: 'nav-item-orders', href: '/orders' },
  { key: 'profile' as const, icon: User, ui: SHARED_LAYOUT.BOTTOM_NAV.ITEMS.PROFILE_LINK, id: 'nav-item-profile', href: '/profile' },
];

export function BottomNavBar() {
  const { t } = useTranslation();
  const [active, setActive] = useState<NavItem>('home');

  return (
    <UiNav
      ui={SHARED_LAYOUT.BOTTOM_NAV.CONTAINER}
      id="bottom-navigation-bar"
      className="fixed bottom-0 start-0 w-full z-50 flex justify-around items-center pt-2 pb-4 border-t rounded-t-2xl shadow-lg"
      style={{
        background: 'rgba(250,248,255,0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(195,198,213,0.40)',
      }}
    >
      {NAV_ITEMS.map(({ key, icon: Icon, ui, id, href }) => {
        const isActive = active === key;
        const isNotif = key === 'notifications';
        return (
          <UiLink
            key={key}
            ui={ui}
            id={id}
            href={href}
            className="flex flex-col items-center justify-center relative py-1 px-3 transition-transform active:scale-90"
            style={{
              color: isActive ? 'var(--gova-primary)' : 'var(--gova-on-surface-variant)',
              fontWeight: isActive ? '700' : '400',
              textDecoration: 'none',
            }}
            onClick={() => {
              setActive(key);
            }}
          >
            <Icon className="w-5 h-5 transition-transform duration-200" style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }} />
            {isNotif && (
              <UiDiv ui={COMMON_LAYOUT.CONTAINER}
                id="nav-notif-badge"
                className="absolute top-0 end-1/2 translate-x-3 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse-gova"
                style={{ background: 'var(--gova-google-red)' }}
              />
            )}
            <span className="text-xs leading-4 font-semibold mt-0.5">{t(ui)}</span>
            {isActive && (
              <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gova" />
            )}
          </UiLink>
        );
      })}
    </UiNav>
  );
}
