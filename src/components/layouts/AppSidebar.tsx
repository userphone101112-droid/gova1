'use client';

import React, { useEffect, useRef } from 'react';
import { UiButton } from '@/components/ui';
import { SHARED_LAYOUT } from '@/shared/ui-registry';
import { X, LogIn, Globe, Sun, Moon } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/core/useTranslation';
import { useSettingsStore } from '@/store/settings.store';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale } = useTranslation();
  const { settings, setSettings } = useSettingsStore();

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  // Toggle language
  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    setLocale(newLocale);
    // Update settings to reflect the change
    setSettings({
      language: newLocale,
      languageMode: 'manual'
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : settings.theme === 'light' ? 'dark' : 'system';
    setSettings({ theme: newTheme });
  };

  // Determine current theme icon
  const getThemeIcon = () => {
    if (settings.theme === 'dark') {
      return <Moon className="w-5 h-5" />;
    }
    if (settings.theme === 'light') {
      return <Sun className="w-5 h-5" />;
    }
    // System theme - use sun/moon based on system preference
    return <Sun className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay with fade animation */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar with slide animation */}
    <div
      ref={sidebarRef}
      className={`absolute top-0 h-full w-80 bg-background shadow-2xl transition-transform duration-300 ease-out ${
        locale === 'ar'
          ? isOpen ? 'translate-x-0' : '-translate-x-full'
          : isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        insetInlineStart: locale === 'ar' ? 'auto' : 0,
        insetInlineEnd: locale === 'ar' ? 0 : 'auto',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'var(--gova-background)',
        borderInlineEnd: locale === 'ar' ? '1px solid var(--gova-outline-variant)' : 'none',
        borderInlineStart: locale !== 'ar' ? '1px solid var(--gova-outline-variant)' : 'none',
      }}
    >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary">القائمة</h2>
          <UiButton
            ui={SHARED_LAYOUT.SIDEBAR.CLOSE_BUTTON}
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </UiButton>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Login Button */}
            <UiButton
              ui={SHARED_LAYOUT.SIDEBAR.LOGIN_BUTTON}
              className="w-full flex items-center justify-center gap-3 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                window.location.href = '/login';
              }}
            >
              <LogIn className="w-5 h-5" />
              <span>تسجيل الدخول</span>
            </UiButton>

            {/* Divider */}
            <div className="h-px bg-border w-full" />

            {/* Language Toggle */}
            <UiButton
              ui={SHARED_LAYOUT.SIDEBAR.LANGUAGE_TOGGLE}
              variant="secondary"
              className="w-full flex items-center justify-between gap-3 h-12 text-base"
              onClick={toggleLanguage}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5" />
                <span>{locale === 'ar' ? 'اللغة' : 'Language'}</span>
              </div>
              <span className="font-semibold">{locale === 'ar' ? 'EN' : 'عربي'}</span>
            </UiButton>

            {/* Theme Toggle */}
            <UiButton
              ui={SHARED_LAYOUT.SIDEBAR.THEME_TOGGLE}
              variant="secondary"
              className="w-full flex items-center justify-between gap-3 h-12 text-base"
              onClick={toggleTheme}
            >
              <div className="flex items-center gap-3">
                {getThemeIcon()}
                <span>{settings.theme === 'dark' ? 'الوضع المعتم' : settings.theme === 'light' ? 'الوضع الفاتح' : 'الوضع الافتراضي'}</span>
              </div>
              <span className="font-semibold capitalize">{settings.theme}</span>
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  );
}