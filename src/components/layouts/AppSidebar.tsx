'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UiButton } from '@/components/ui';
import { SHARED_LAYOUT } from '@/shared/ui-registry';
import { X, LogIn, Globe, Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
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
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

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
      // Close language dropdown if clicked outside
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setLanguageDropdownOpen(false);
      }
      // Close theme dropdown if clicked outside
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(event.target as Node)
      ) {
        setThemeDropdownOpen(false);
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

  // Change language
  const changeLanguage = (newLocale: 'ar' | 'en') => {
    setLocale(newLocale);
    // Update settings to reflect the change
    setSettings({
      language: newLocale,
      languageMode: 'manual'
    });
    setLanguageDropdownOpen(false);
  };

  // Change theme
  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setSettings({ theme: newTheme });
    setThemeDropdownOpen(false);
  };

  // Determine current theme icon
  const getThemeIcon = () => {
    if (settings.theme === 'dark') {
      return <Moon className="w-5 h-5" />;
    }
    if (settings.theme === 'light') {
      return <Sun className="w-5 h-5" />;
    }
    // System theme
    return <Monitor className="w-5 h-5" />;
  };

  const getLanguageLabel = () => {
    if (locale === 'ar') return 'العربية';
    return 'English';
  };

  const getThemeLabel = () => {
    if (settings.theme === 'dark') return locale === 'ar' ? 'الوضع المعتم' : 'Dark Mode';
    if (settings.theme === 'light') return locale === 'ar' ? 'الوضع الفاتح' : 'Light Mode';
    return locale === 'ar' ? 'الوضع الافتراضي' : 'System Default';
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
      className={`absolute w-80 bg-background shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
        locale === 'ar'
          ? isOpen ? 'translate-x-0' : '-translate-x-full'
          : isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        top: '64px', // header height is h-16 = 64px
        bottom: '0',
        height: 'calc(100dvh - 64px - 72px)', // 64px header, 72px bottom nav
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

            {/* Language Dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <UiButton
                ui={SHARED_LAYOUT.SIDEBAR.LANGUAGE_TOGGLE}
                variant="secondary"
                className="w-full flex items-center justify-between gap-3 h-12 text-base"
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5" />
                  <span>{locale === 'ar' ? 'اللغة' : 'Language'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{getLanguageLabel()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </UiButton>

              {/* Language Dropdown Menu */}
              {languageDropdownOpen && (
                <div className="absolute z-50 top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                  <button
                    className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between ${locale === 'ar' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeLanguage('ar')}
                  >
                    <span>العربية</span>
                    {locale === 'ar' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                  <button
                    className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between ${locale === 'en' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeLanguage('en')}
                  >
                    <span>English</span>
                    {locale === 'en' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                </div>
              )}
            </div>

            {/* Theme Dropdown */}
            <div className="relative" ref={themeDropdownRef}>
              <UiButton
                ui={SHARED_LAYOUT.SIDEBAR.THEME_TOGGLE}
                variant="secondary"
                className="w-full flex items-center justify-between gap-3 h-12 text-base"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              >
                <div className="flex items-center gap-3">
                  {getThemeIcon()}
                  <span>{getThemeLabel()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{settings.theme}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${themeDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </UiButton>

              {/* Theme Dropdown Menu */}
              {themeDropdownOpen && (
                <div className="absolute z-50 top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                  <button
                    className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 ${settings.theme === 'light' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeTheme('light')}
                  >
                    <Sun className="w-4 h-4" />
                    <span>{locale === 'ar' ? 'الوضع الفاتح' : 'Light Mode'}</span>
                    {settings.theme === 'light' && <div className="w-2 h-2 rounded-full bg-primary ms-auto" />}
                  </button>
                  <button
                    className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 ${settings.theme === 'dark' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeTheme('dark')}
                  >
                    <Moon className="w-4 h-4" />
                    <span>{locale === 'ar' ? 'الوضع المعتم' : 'Dark Mode'}</span>
                    {settings.theme === 'dark' && <div className="w-2 h-2 rounded-full bg-primary ms-auto" />}
                  </button>
                  <button
                    className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 ${settings.theme === 'system' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeTheme('system')}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>{locale === 'ar' ? 'الوضع الافتراضي' : 'System Default'}</span>
                    {settings.theme === 'system' && <div className="w-2 h-2 rounded-full bg-primary ms-auto" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}