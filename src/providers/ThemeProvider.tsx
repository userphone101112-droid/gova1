'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/store/settings.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettingsStore();

  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      // Determine the effective theme
      let effectiveTheme: 'light' | 'dark';
      
      if (settings.theme === 'system') {
        // Check system preference
        const systemPrefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        effectiveTheme = systemPrefersDark ? 'dark' : 'light';
      } else {
        effectiveTheme = settings.theme as 'light' | 'dark';
      }
      
      // Add the effective theme class
      root.classList.add(effectiveTheme);
    };
    
    applyTheme();
    
    // Listen for system theme changes if using system theme
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  return <>{children}</>;
}