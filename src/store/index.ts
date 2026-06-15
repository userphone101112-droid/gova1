import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        isLoading: false,
        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ isLoading: state.isLoading }),
      }
    )
  )
);

interface MaolState {
  isEnabled: boolean;
  toggleMaol: () => void;
}

export const useMaolStore = create<MaolState>()(
  devtools(
    persist(
      (set) => ({
        isEnabled: true, // default ON
        toggleMaol: () => set((state) => ({ isEnabled: !state.isEnabled })),
      }),
      {
        name: 'maol-storage',
        partialize: (state) => ({ isEnabled: state.isEnabled }),
      }
    )
  )
);
