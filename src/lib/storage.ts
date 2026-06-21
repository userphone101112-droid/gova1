'use client';

import { govaDbClearAll } from '@/lib/gova-db';

export function calculateLocalStorageSize(): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0;

  let totalSize = 0;

  // Calculate size of localStorage
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      try {
        const value = localStorage.getItem(key) || '';
        // Each character in JavaScript is 2 bytes (UTF-16)
        totalSize += (key.length + value.length) * 2;
      } catch {
        // Ignore any errors
      }
    }
  }

  return totalSize;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function clearLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.clear();
}

export function clearCookies(): void {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}

export async function clearIndexedDB(): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;

  const dbs = await window.indexedDB.databases();
  for (const db of dbs) {
    if (db.name) {
      await new Promise<void>((resolve) => {
        const request = window.indexedDB.deleteDatabase(db.name as string);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    }
  }
}

export async function clearAllStorage(): Promise<void> {
  clearLocalStorage();
  clearCookies();
  await govaDbClearAll();
  await clearIndexedDB();
}
