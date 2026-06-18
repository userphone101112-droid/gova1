import { AppShell } from '@/components/layouts/AppShell';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
