'use client';

import type { ReactNode } from 'react';

import { DEVTOOLS } from '@/platform/ui/registry/features/devtools';

import type { SidebarSectionTone } from '../utils/sidebar-section-theme';
import { getSidebarSectionTone } from '../utils/sidebar-section-theme';

type SidebarSectionProps = {
  toggleButton: ReactNode;
  open: boolean;
  children?: ReactNode;
  tone?: SidebarSectionTone;
};

export function SidebarSection({ toggleButton, open, children, tone }: SidebarSectionProps) {
  if (!tone) {
    return (
      <>
        {toggleButton}
        {open ? children : null}
      </>
    );
  }

  const styles = getSidebarSectionTone(tone);
  return (
    <section
      data-ui-uuid={DEVTOOLS.UI_INSPECTOR.SIDEBAR.CONTAINER.uuid}
      data-ui-instance-id={`sidebar-tone-${tone}`}
      className={styles.shell}
    >
      {toggleButton}
      {open ? (
        <div
          data-ui-uuid={DEVTOOLS.UI_INSPECTOR.DATA.CONTAINER.uuid}
          data-ui-instance-id={`sidebar-tone-${tone}-content`}
          className={styles.content}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
