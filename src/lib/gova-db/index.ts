'use client';

/**
 * GovaDB - Centralized IndexedDB Storage for Gova Project
 * Single Source of Truth (SSOT) for all client-side storage
 * 
 * Rules:
 * - ALL client-side data must be stored in GovaDB, NO EXCEPTIONS
 * - Direct use of localStorage, sessionStorage, or cookies is forbidden
 * - Use typed stores for each data category
 * 
 * Structure:
 * - Stores are defined as object stores with key paths
 * - Each store has a dedicated API for type safety
 */

// --- Constants ---
const DB_NAME = 'GovaDB';
const DB_VERSION = 2; // Bumped from 1 to 2 to add missing stores

export const GOVA_DB_STORES = {
  /** Guest session data (from use-guest-session.ts) */
  GUEST_SESSIONS: 'guestSessions',
  /** UI Inspector layout and preferences */
  UI_INSPECTOR: 'uiInspector',
  /** App settings and preferences (unified store) */
  APP_SETTINGS: 'appSettings',
  /** Authentication tokens and session data */
  AUTH: 'auth',
} as const;

export type GovaDbStoreName = typeof GOVA_DB_STORES[keyof typeof GOVA_DB_STORES];

// --- Core DB Connection ---
let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const idb = (event.target as IDBOpenDBRequest).result;
      
      // Create ALL object stores if they don't exist (regardless of upgrade path)
      for (const storeName of Object.values(GOVA_DB_STORES)) {
        if (!idb.objectStoreNames.contains(storeName)) {
          idb.createObjectStore(storeName, { keyPath: 'key' });
        }
      }
    };
  });
}

// --- Generic CRUD Operations ---
async function getStore(
  storeName: GovaDbStoreName,
  mode: 'readonly' | 'readwrite' = 'readonly'
): Promise<IDBObjectStore> {
  const db = await getDB();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

async function idbRequestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic function to get a value from GovaDB by key
 */
export async function govaDbGet<T>(storeName: GovaDbStoreName, key: string): Promise<T | null> {
  const store = await getStore(storeName, 'readonly');
  const result = await idbRequestToPromise<{ key: string; value: T } | undefined>(
    store.get(key)
  );
  return result?.value ?? null;
}

/**
 * Generic function to set a value in GovaDB by key
 */
export async function govaDbSet<T>(storeName: GovaDbStoreName, key: string, value: T): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  await idbRequestToPromise(store.put({ key, value }));
}

/**
 * Generic function to delete a value from GovaDB by key
 */
export async function govaDbDelete(storeName: GovaDbStoreName, key: string): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  await idbRequestToPromise(store.delete(key));
}

/**
 * Clear all entries from a store
 */
export async function govaDbClearStore(storeName: GovaDbStoreName): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  await idbRequestToPromise(store.clear());
}

/**
 * Clear ALL data in GovaDB (for development/reset purposes)
 */
export async function govaDbClearAll(): Promise<void> {
  await getDB(); // Wait for DB to open (in case not yet initialized)
  for (const storeName of Object.values(GOVA_DB_STORES)) {
    await govaDbClearStore(storeName);
  }
}

// --- Typed API: Guest Session ---
const GUEST_SESSION_KEY = 'current';
export interface GuestSessionData {
  id: string;
  createdAt: string;
}

export async function govaDbGetGuestSession(): Promise<GuestSessionData | null> {
  return govaDbGet<GuestSessionData>(GOVA_DB_STORES.GUEST_SESSIONS, GUEST_SESSION_KEY);
}

export async function govaDbSetGuestSession(session: GuestSessionData): Promise<void> {
  return govaDbSet<GuestSessionData>(GOVA_DB_STORES.GUEST_SESSIONS, GUEST_SESSION_KEY, session);
}

export async function govaDbDeleteGuestSession(): Promise<void> {
  return govaDbDelete(GOVA_DB_STORES.GUEST_SESSIONS, GUEST_SESSION_KEY);
}

// --- Typed API: UI Inspector ---
export interface UiInspectorData {
  sidebarWidth?: number;
  previewSize?: { width: number; height: number; scale: number };
  pickModeEnabled?: boolean;
  framesModeEnabled?: boolean;
}

const UI_INSPECTOR_KEY = 'uiInspector';

export async function govaDbGetUiInspector(): Promise<UiInspectorData> {
  return (await govaDbGet<UiInspectorData>(GOVA_DB_STORES.UI_INSPECTOR, UI_INSPECTOR_KEY)) ?? {};
}

export async function govaDbSetUiInspector(data: Partial<UiInspectorData>): Promise<void> {
  const current = await govaDbGetUiInspector();
  return govaDbSet<UiInspectorData>(GOVA_DB_STORES.UI_INSPECTOR, UI_INSPECTOR_KEY, {
    ...current,
    ...data,
  });
}

// --- Typed API: Auth ---
export interface AuthData {
  authToken?: string;
}

const AUTH_KEY = 'auth';

export async function govaDbGetAuth(): Promise<AuthData> {
  return (await govaDbGet<AuthData>(GOVA_DB_STORES.AUTH, AUTH_KEY)) ?? {};
}

export async function govaDbSetAuth(data: Partial<AuthData>): Promise<void> {
  const current = await govaDbGetAuth();
  return govaDbSet<AuthData>(GOVA_DB_STORES.AUTH, AUTH_KEY, {
    ...current,
    ...data,
  });
}

// --- Zustand Persist Middleware Helper ---
import type { StateStorage } from 'zustand/middleware';

/**
 * Zustand persist storage adapter for GovaDB
 */
export function createGovaDbZustandStorage(
  storeName: GovaDbStoreName
): StateStorage {
  return {
    getItem: async (name) => {
      const val = await govaDbGet<string>(storeName, name);
      return val ?? null;
    },
    setItem: async (name, value) => {
      await govaDbSet<string>(storeName, name, value);
    },
    removeItem: async (name) => {
      await govaDbDelete(storeName, name);
    },
  };
}
