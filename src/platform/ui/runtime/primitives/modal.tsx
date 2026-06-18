'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
  overlayClassName?: string;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open = false, onClose, overlayClassName, children, ...props }, ref) => {
    if (!open) {
      return null;
    }

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4',
          overlayClassName
        )}
        role="presentation"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg',
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';

export { Modal };
