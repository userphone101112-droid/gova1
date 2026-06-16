'use client';

import React, { useEffect, useRef } from 'react';
import { UiButton } from '@/components/ui';
import { SHARED_LAYOUT } from '@/shared/ui-registry';
import { X, LogIn } from 'lucide-react';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close sidebar when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="absolute top-0 end-0 h-full w-80 bg-background shadow-xl"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">القائمة</h2>
          <UiButton
            ui={SHARED_LAYOUT.SIDEBAR.CLOSE_BUTTON}
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </UiButton>
        </div>
        
        {/* Sidebar Content */}
        <div className="p-4">
          <UiButton
            ui={SHARED_LAYOUT.SIDEBAR.LOGIN_BUTTON}
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            <LogIn className="w-5 h-5" />
            <span>تسجيل الدخول</span>
          </UiButton>
        </div>
      </div>
    </div>
  );
}
