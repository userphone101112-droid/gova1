'use client';

import * as React from 'react';

const GUEST_SESSION_KEY = 'guest_session';

interface GuestSession {
  id: string;
  createdAt: string;
}

interface UseGuestSessionReturn {
  isGuest: boolean;
  guestId: string | null;
  startGuestSession: () => void;
  endGuestSession: () => void;
}

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getStoredSession(): GuestSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(GUEST_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestSession;
    if (parsed.id && parsed.createdAt) return parsed;
    return null;
  } catch {
    return null;
  }
}

function setStoredSession(session: GuestSession | null): void {
  if (typeof window === 'undefined') return;
  if (session) {
    window.localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(GUEST_SESSION_KEY);
  }
}

export function useGuestSession(): UseGuestSessionReturn {
  const [session, setSession] = React.useState<GuestSession | null>(() => getStoredSession());

  const startGuestSession = React.useCallback(() => {
    const newSession: GuestSession = {
      id: generateGuestId(),
      createdAt: new Date().toISOString(),
    };
    setStoredSession(newSession);
    setSession(newSession);
  }, []);

  const endGuestSession = React.useCallback(() => {
    setStoredSession(null);
    setSession(null);
  }, []);

  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === GUEST_SESSION_KEY) {
        setSession(getStoredSession());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    isGuest: !!session,
    guestId: session?.id ?? null,
    startGuestSession,
    endGuestSession,
  };
}
