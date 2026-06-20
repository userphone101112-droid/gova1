'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PageRegistryEntry } from '../data/page-registry.types';
import { loadPageRegistry } from '../services/page-registry.service';

export function usePageRegistry() {
  const [pages, setPages] = useState<PageRegistryEntry[]>([]);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshPages = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await loadPageRegistry();
      setPages(snapshot.pages);
      setLoadedAt(snapshot.loadedAt);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPages();
  }, [refreshPages]);

  return {
    pages,
    loadedAt,
    loading,
    refreshPages,
  };
}
