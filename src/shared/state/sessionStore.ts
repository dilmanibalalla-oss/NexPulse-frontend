import { create } from 'zustand';

import { clearAuthToken, readAuthToken, saveAuthToken } from '@/shared/storage/tokenStorage';

type SessionState = {
  token: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  clearSession: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set) => ({
  token: null,
  hydrated: false,
  hydrate: async () => {
    try {
      const stored = await readAuthToken();
      set({ token: stored?.trim() ? stored : null, hydrated: true });
    } catch {
      set({ token: null, hydrated: true });
    }
  },
  setToken: async (token) => {
    if (!token.trim()) {
      throw new Error('Cannot store an empty session token.');
    }

    await saveAuthToken(token);
    set({ token });
  },
  clearSession: async () => {
    await clearAuthToken();
    set({ token: null });
  },
}));
