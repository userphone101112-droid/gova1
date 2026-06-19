import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNavBar } from './BottomNavBar';
import { UiMain } from '@/platform/ui';
import { COMMON_LAYOUT } from '@/platform/ui/registry/categories';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell wraps in-app routes with AppHeader, AppSidebar (drawer), and BottomNavBar.
 * Applied globally via `src/app/(shell)/layout.tsx` — add new pages under `(shell)/`.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <AppHeader />
      {/* pt-16 = header height, pb-24 = bottom nav height on mobile, pb-6 on desktop */}
      <UiMain ui={COMMON_LAYOUT.MAIN} className="pt-16 pb-24 md:pb-6 min-h-screen" style={{ background: 'var(--gova-background)' }}>
        {children}
      </UiMain>
      <BottomNavBar />
    </>
  );
}
