'use client';

import React, { useEffect } from 'react';
import { initializeGlobalSSOT } from '@/store/global-ssot.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the global SSOT system on client mount
    initializeGlobalSSOT();
  }, []);

  return <>{children}</>;
}