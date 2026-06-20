'use client';

import { Home, Bell, Heart, Receipt, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useTranslation, SHARED_LAYOUT } from '@/platform/ui';

type NavItem = 'home' | 'notifications' | 'favorites' | 'orders' | 'profile';

export function BottomNavBar() {
  const { t } = useTranslation();
  const [active, setActive] = useState<NavItem>('home');

  return (
    <nav
      data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.CONTAINER.uuid}
      id="bottom-navigation-bar"
      className="fixed bottom-0 start-0 w-full z-50 flex justify-around items-center pt-2 pb-4 border-t rounded-t-2xl shadow-lg"
      style={{
        background: 'var(--gova-surface)',
        borderColor: 'var(--gova-outline-variant)',
      }}
    >
      <Link
        data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.HOME_LINK.uuid}
        id="nav-item-home"
        href="/home"
        className="flex flex-col items-center justify-center relative py-1 px-3 transition-transform active:scale-90"
        style={{
          color: active === 'home' ? 'var(--gova-primary)' : 'var(--gova-on-surface-variant)',
          fontWeight: active === 'home' ? '700' : '400',
          textDecoration: 'none',
        }}
        onClick={() => setActive('home')}
      >
        <Home className="w-5 h-5 transition-transform duration-200" style={{ transform: active === 'home' ? 'scale(1.1)' : 'scale(1)' }} />
        <span data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.HOME_LINK_LABEL.uuid} className="text-xs leading-4 font-semibold mt-0.5">
          {t(SHARED_LAYOUT.BOTTOM_NAV.ITEMS.HOME_LINK)}
        </span>
        {active === 'home' && (
          <div data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.HOME_ACTIVE_INDICATOR.uuid} className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gova" />
        )}
      </Link>

      <Link
        data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.NOTIFICATIONS_LINK.uuid}
        id="nav-item-notifications"
        href="/notifications"
        className="flex flex-col items-center justify-center relative py-1 px-3 transition-transform active:scale-90"
        style={{
          color: active === 'notifications' ? 'var(--gova-primary)' : 'var(--gova-on-surface-variant)',
          fontWeight: active === 'notifications' ? '700' : '400',
          textDecoration: 'none',
        }}
        onClick={() => setActive('notifications')}
      >
        <Bell className="w-5 h-5 transition-transform duration-200" style={{ transform: active === 'notifications' ? 'scale(1.1)' : 'scale(1)' }} />
        <div
          data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.NOTIFICATIONS_BADGE.uuid}
          id="nav-notif-badge"
          className="absolute top-0 end-1/2 translate-x-3 w-2.5 h-2.5 rounded-full border-2 border-surface-container-lowest animate-pulse-gova"
          style={{ background: 'var(--gova-error)' }}
        />
        <span data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.NOTIFICATIONS_LINK_LABEL.uuid} className="text-xs leading-4 font-semibold mt-0.5">
          {t(SHARED_LAYOUT.BOTTOM_NAV.ITEMS.NOTIFICATIONS_LINK)}
        </span>
        {active === 'notifications' && (
          <div data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.NOTIFICATIONS_ACTIVE_INDICATOR.uuid} className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gova" />
        )}
      </Link>

      <Link
        data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.FAVORITES_LINK.uuid}
        id="nav-item-favorites"
        href="/favorites"
        className="flex flex-col items-center justify-center relative py-1 px-3 transition-transform active:scale-90"
        style={{
          color: active === 'favorites' ? 'var(--gova-primary)' : 'var(--gova-on-surface-variant)',
          fontWeight: active === 'favorites' ? '700' : '400',
          textDecoration: 'none',
        }}
        onClick={() => setActive('favorites')}
      >
        <Heart className="w-5 h-5 transition-transform duration-200" style={{ transform: active === 'favorites' ? 'scale(1.1)' : 'scale(1)' }} />
        <span data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.FAVORITES_LINK_LABEL.uuid} className="text-xs leading-4 font-semibold mt-0.5">
          {t(SHARED_LAYOUT.BOTTOM_NAV.ITEMS.FAVORITES_LINK)}
        </span>
        {active === 'favorites' && (
          <div data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.FAVORITES_ACTIVE_INDICATOR.uuid} className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gova" />
        )}
      </Link>

      <Link
        data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.ORDERS_LINK.uuid}
        id="nav-item-orders"
        href="/orders"
        className="flex flex-col items-center justify-center relative py-1 px-3 transition-transform active:scale-90"
        style={{
          color: active === 'orders' ? 'var(--gova-primary)' : 'var(--gova-on-surface-variant)',
          fontWeight: active === 'orders' ? '700' : '400',
          textDecoration: 'none',
        }}
        onClick={() => setActive('orders')}
      >
        <Receipt className="w-5 h-5 transition-transform duration-200" style={{ transform: active === 'orders' ? 'scale(1.1)' : 'scale(1)' }} />
        <span data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.ORDERS_LINK_LABEL.uuid} className="text-xs leading-4 font-semibold mt-0.5">
          {t(SHARED_LAYOUT.BOTTOM_NAV.ITEMS.ORDERS_LINK)}
        </span>
        {active === 'orders' && (
          <div data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.ORDERS_ACTIVE_INDICATOR.uuid} className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gova" />
        )}
      </Link>

      <Link
        data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.PROFILE_LINK.uuid}
        id="nav-item-profile"
        href="/profile"
        className="flex flex-col items-center justify-center relative py-1 px-3 transition-transform active:scale-90"
        style={{
          color: active === 'profile' ? 'var(--gova-primary)' : 'var(--gova-on-surface-variant)',
          fontWeight: active === 'profile' ? '700' : '400',
          textDecoration: 'none',
        }}
        onClick={() => setActive('profile')}
      >
        <User className="w-5 h-5 transition-transform duration-200" style={{ transform: active === 'profile' ? 'scale(1.1)' : 'scale(1)' }} />
        <span data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.PROFILE_LINK_LABEL.uuid} className="text-xs leading-4 font-semibold mt-0.5">
          {t(SHARED_LAYOUT.BOTTOM_NAV.ITEMS.PROFILE_LINK)}
        </span>
        {active === 'profile' && (
          <div data-ui-uuid={SHARED_LAYOUT.BOTTOM_NAV.ITEMS.PROFILE_ACTIVE_INDICATOR.uuid} className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gova" />
        )}
      </Link>
    </nav>
  );
}
