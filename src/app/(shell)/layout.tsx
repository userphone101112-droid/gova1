import { AppShell } from '@/components/layouts/AppShell';

/**
 * Shared shell for all in-app routes.
 * New feature pages placed under `(shell)/` automatically receive
 * AppHeader, AppSidebar (via header menu), and BottomNavBar.
 * Splash remains at `/` outside this group.
 */
export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
