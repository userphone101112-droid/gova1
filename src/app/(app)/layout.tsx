import { AppShell } from '@/components/layouts/AppShell';

/**
 * App route group — all in-app pages inherit AppShell (header, sidebar, bottom nav).
 * Splash lives at `/` outside this group. Route group name `(app)` is not part of URLs.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
