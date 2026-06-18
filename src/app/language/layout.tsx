import { AppShell } from '@/components/layouts/AppShell';

export default function LanguageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
