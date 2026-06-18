'use client';

import { useEffect, useRef, useState } from 'react';
import { UiButton, UiDiv } from '@/platform/ui';
import { SHARED_LAYOUT } from '@/platform/ui';
import { COMMON_LAYOUT, DECORATIVE } from '@/platform/ui/registry/categories';
import { X, LogIn, Globe, Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/platform/ui';
import { useGlobalSSOTStore } from '@/store/global-ssot.store';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale, t } = useTranslation();
  const { themeMode, setThemeMode } = useGlobalSSOTStore();
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setLanguageDropdownOpen(false);
  };

  // Change theme
  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeMode(newTheme);
    setThemeDropdownOpen(false);
  };

  // Determine current theme icon
  const getThemeIcon = () => {
    if (themeMode === 'dark') {
      return <Moon className="w-5 h-5" />;
    }
    if (themeMode === 'light') {
      return <Sun className="w-5 h-5" />;
    }
    // System theme
    return <Monitor className="w-5 h-5" />;
  };

  const getLanguageLabel = () => {
    if (!mounted) return t(SHARED_LAYOUT.SIDEBAR.LANGUAGE_TOGGLE);
    return locale === 'ar'
      ? t('shared-layout.sidebar.arabic')
      : t('shared-layout.sidebar.english');
  };

  const getThemeLabel = () => {
    if (!mounted) return t('shared-layout.sidebar.system');
    if (themeMode === 'dark') return t('shared-layout.sidebar.dark');
    if (themeMode === 'light') return t('shared-layout.sidebar.light');
    return t('shared-layout.sidebar.system');
  };

  return (
    <UiDiv ui={SHARED_LAYOUT.SIDEBAR.CONTAINER} className="fixed inset-0 z-40">
      {/* Overlay with fade animation */}
      <UiDiv
        ui={SHARED_LAYOUT.SIDEBAR.OVERLAY}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar with slide animation */}
      <UiDiv
        ui={SHARED_LAYOUT.SIDEBAR.SIDEBAR_PANEL}
        ref={sidebarRef}
        className={`absolute bg-background shadow-2xl transition-transform duration-300 ease-out overflow-y-auto glass-effect app-sidebar ${
          locale === 'ar'
            ? isOpen ? 'translate-x-0' : 'translate-x-full'
            : isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <UiDiv
          ui={SHARED_LAYOUT.SIDEBAR.HEADER}
          className="flex items-center justify-between p-6 border-b border-border"
        >
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="text-xl font-bold text-primary">
            {t(SHARED_LAYOUT.HEADER.MENU.MENU_BUTTON)}
          </UiDiv>
          <UiButton
            ui={SHARED_LAYOUT.SIDEBAR.CLOSE_BUTTON}
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </UiButton>
        </UiDiv>

        {/* Sidebar Content */}
        <UiDiv
          ui={SHARED_LAYOUT.SIDEBAR.CONTENT}
          className="flex-1 p-6 space-y-6"
        >
          {/* Action Buttons */}
          <UiDiv
            ui={SHARED_LAYOUT.SIDEBAR.ACTIONS_SECTION}
            className="space-y-4"
          >
            {/* Login Button */}
            <UiButton
              ui={SHARED_LAYOUT.SIDEBAR.LOGIN_BUTTON}
              className="w-full flex items-center justify-center gap-3 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                window.location.href = '/login';
              }}
            >
              <LogIn className="w-5 h-5" />
              <span>{t(SHARED_LAYOUT.SIDEBAR.LOGIN_BUTTON)}</span>
            </UiButton>

            {/* Divider */}
            <UiDiv ui={DECORATIVE.DIVIDER} className="h-px bg-border w-full" />

            {/* Language Dropdown */}
            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative" ref={languageDropdownRef}>
              <UiButton
                ui={SHARED_LAYOUT.SIDEBAR.LANGUAGE_TOGGLE}
                variant="secondary"
                className="w-full flex items-center justify-between gap-3 h-12 text-base"
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              >
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-3">
                  <Globe className="w-5 h-5" />
                  <span>{t(SHARED_LAYOUT.SIDEBAR.LANGUAGE_TOGGLE)}</span>
                </UiDiv>
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-2">
                  <span className="font-semibold">{getLanguageLabel()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                </UiDiv>
              </UiButton>

              {/* Language Dropdown Menu */}
              {languageDropdownOpen && (
                <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="absolute z-50 top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                  <button
                    className={`w-full px-4 py-3 text-start hover:bg-muted transition-colors flex items-center justify-between ${locale === 'ar' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeLanguage('ar')}
                  >
                    <span>{t('shared-layout.sidebar.arabic')}</span>
                    {locale === 'ar' && <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                  <button
                    className={`w-full px-4 py-3 text-start hover:bg-muted transition-colors flex items-center justify-between ${locale === 'en' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeLanguage('en')}
                  >
                    <span>{t('shared-layout.sidebar.english')}</span>
                    {locale === 'en' && <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                </UiDiv>
              )}
            </UiDiv>

            {/* Theme Dropdown */}
            <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="relative" ref={themeDropdownRef}>
              <UiButton
                ui={SHARED_LAYOUT.SIDEBAR.THEME_TOGGLE}
                variant="secondary"
                className="w-full flex items-center justify-between gap-3 h-12 text-base"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              >
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-3">
                  {getThemeIcon()}
                  <span>{getThemeLabel()}</span>
                </UiDiv>
                <UiDiv ui={COMMON_LAYOUT.WRAPPER} className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{getThemeLabel()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${themeDropdownOpen ? 'rotate-180' : ''}`} />
                </UiDiv>
              </UiButton>

              {/* Theme Dropdown Menu */}
              {themeDropdownOpen && (
                <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="absolute z-50 top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                  <button
                    className={`w-full px-4 py-3 text-start hover:bg-muted transition-colors flex items-center gap-3 ${themeMode === 'light' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeTheme('light')}
                  >
                    <Sun className="w-4 h-4" />
                    <span>{t('shared-layout.sidebar.light')}</span>
                    {themeMode === 'light' && <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-2 h-2 rounded-full bg-primary ms-auto" />}
                  </button>
                  <button
                    className={`w-full px-4 py-3 text-start hover:bg-muted transition-colors flex items-center gap-3 ${themeMode === 'dark' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeTheme('dark')}
                  >
                    <Moon className="w-4 h-4" />
                    <span>{t('shared-layout.sidebar.dark')}</span>
                    {themeMode === 'dark' && <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-2 h-2 rounded-full bg-primary ms-auto" />}
                  </button>
                  <button
                    className={`w-full px-4 py-3 text-start hover:bg-muted transition-colors flex items-center gap-3 ${themeMode === 'system' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => changeTheme('system')}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>{t('shared-layout.sidebar.system')}</span>
                    {themeMode === 'system' && <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="w-2 h-2 rounded-full bg-primary ms-auto" />}
                  </button>
                </UiDiv>
              )}
            </UiDiv>
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiDiv>
  );
}