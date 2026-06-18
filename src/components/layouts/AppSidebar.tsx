'use client';

import { useEffect, useRef } from 'react';
import { UiButton, UiDiv } from '@/platform/ui';
import { SHARED_LAYOUT } from '@/platform/ui';
import { LogIn, Globe } from 'lucide-react';
import { useTranslation } from '@/platform/ui';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useTranslation();
  const isArabic = locale === 'ar';

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerOutside = (event: PointerEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerOutside);
    return () => document.removeEventListener('pointerdown', handlePointerOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <UiDiv
      ui={SHARED_LAYOUT.SIDEBAR.CONTAINER}
      className={`fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <UiDiv
        ui={SHARED_LAYOUT.SIDEBAR.OVERLAY}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <UiDiv
        ui={SHARED_LAYOUT.SIDEBAR.SIDEBAR_PANEL}
        ref={sidebarRef}
        role="dialog"
        aria-modal={isOpen}
        aria-label={t(SHARED_LAYOUT.HEADER.MENU.MENU_BUTTON)}
        className={[
          'fixed top-0 z-50 flex h-dvh w-72 flex-col bg-background transition-transform duration-300 ease-out',
          isArabic
            ? 'inset-inline-end-0 border-s border-border'
            : 'inset-inline-start-0 border-e border-border',
          isOpen
            ? 'translate-x-0'
            : isArabic
              ? 'translate-x-full'
              : '-translate-x-full',
        ].join(' ')}
      >
        <UiDiv
          ui={SHARED_LAYOUT.SIDEBAR.CONTENT}
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 pt-5"
        >
          <UiDiv ui={SHARED_LAYOUT.SIDEBAR.ACTIONS_SECTION} className="flex flex-col gap-1">
            <UiButton
              ui={SHARED_LAYOUT.SIDEBAR.LOGIN_BUTTON}
              variant="ghost"
              className="h-11 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium"
              onClick={() => {
                window.location.href = '/login';
              }}
            >
              <LogIn className="h-5 w-5 shrink-0 opacity-70" />
              <span>{t(SHARED_LAYOUT.SIDEBAR.LOGIN_BUTTON)}</span>
            </UiButton>

            <UiButton
              ui={SHARED_LAYOUT.SIDEBAR.LANGUAGE_TOGGLE}
              variant="ghost"
              className="h-11 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium"
              onClick={() => {
                window.location.href = '/language';
              }}
            >
              <Globe className="h-5 w-5 shrink-0 opacity-70" />
              <span>{t(SHARED_LAYOUT.SIDEBAR.LANGUAGE_TOGGLE)}</span>
            </UiButton>
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
