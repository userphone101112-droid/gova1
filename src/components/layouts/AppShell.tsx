import { ReactNode } from 'react';

import { AppHeader } from './AppHeader';
import { BottomNavBar } from './BottomNavBar';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell wraps in-app routes with AppHeader, AppSidebar (drawer), and BottomNavBar.
 * Applied via `src/app/(app)/layout.tsx` — add new pages under `(app)/`.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <AppHeader />
      {/* pt-16 = header height, pb-24 = bottom nav height on mobile, pb-6 on desktop */}
      <main className="pt-16 pb-24 md:pb-6 min-h-screen" style={{ background: 'var(--gova-background)' }}>
        {children}
      </main>
      <BottomNavBar />
    </>
  );
}
