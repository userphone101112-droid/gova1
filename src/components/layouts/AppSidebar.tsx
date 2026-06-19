'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Settings, X } from 'lucide-react';
import { UiDiv, UiButton } from '@/platform/ui';
import { SHARED_LAYOUT } from '@/platform/ui';
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
    return () => {
      document.removeEventListener('pointerdown', handlePointerOutside);
    };
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
      className={`fixed inset-0 z-scrim ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <UiDiv
        ui={SHARED_LAYOUT.SIDEBAR.OVERLAY}
        className={`absolute inset-0 bg-overlay/40 transition-opacity duration-300 z-scrim ${
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
          'fixed top-0 z-drawer flex h-dvh w-72 flex-col bg-background transition-transform duration-300 ease-out motion-transform',
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
          ui={SHARED_LAYOUT.SIDEBAR.HEADER}
          className="flex items-center justify-between p-3"
        >
          <UiButton
            ui={SHARED_LAYOUT.SIDEBAR.CLOSE_BUTTON}
            id="sidebar-close-button"
            variant="ghost"
            size="icon"
            className="w-10 h-10 flex items-center justify-center rounded-full"
            onClick={onClose}
            aria-label={t(SHARED_LAYOUT.SIDEBAR.CLOSE_BUTTON)}
          >
            <X className="w-5 h-5" />
          </UiButton>
        </UiDiv>

        <UiDiv
          ui={SHARED_LAYOUT.SIDEBAR.CONTENT}
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 pt-1"
        >
          <UiDiv ui={SHARED_LAYOUT.SIDEBAR.ACTIONS_SECTION} className="flex flex-col gap-1">
            <Link href="/settings">
              <UiButton
                ui={SHARED_LAYOUT.SIDEBAR.SETTINGS_BUTTON}
                id="sidebar-settings-button"
                variant="ghost"
                size="lg"
                className="w-full flex items-center justify-start gap-3 text-left"
                onClick={onClose}
              >
                <Settings className="w-5 h-5" />
                {t(SHARED_LAYOUT.SIDEBAR.SETTINGS_BUTTON)}
              </UiButton>
            </Link>
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}
