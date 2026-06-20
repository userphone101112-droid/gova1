'use client';

import type { ReactNode } from 'react';

export const sidebarSectionButtonClass =
  'flex w-full shrink-0 items-center border-b border-outline-variant px-3 py-2 text-start text-sm font-medium hover:bg-surface-variant';

type SidebarSectionProps = {
  toggleButton: ReactNode;
  open: boolean;
  children?: ReactNode;
};

export function SidebarSection({ toggleButton, open, children }: SidebarSectionProps) {
  return (
    <>
      {toggleButton}
      {open ? children : null}
    </>
  );
}
