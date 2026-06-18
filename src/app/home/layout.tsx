import { ReactNode } from 'react';
import { AppShell } from '@/components/layouts/AppShell';

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
