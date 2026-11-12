import { create, type StoreApi, type UseBoundStore } from 'zustand';

export type TokenStorage = {
  read: () => Promise<string | null>;
  save: (token: string) => Promise<void>;
  clear: () => Promise<void>;
};

export type SessionState = {
  token: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  clearSession: () => Promise<void>;
};

export function createSessionStore(storage: TokenStorage): UseBoundStore<StoreApi<SessionState>> {
  return create<SessionState>((set) => ({
    token: null,
    hydrated: false,
    hydrate: async () => {
      try {
        const stored = await storage.read();
        set({ token: stored?.trim() ? stored : null, hydrated: true });
      } catch {
        set({ token: null, hydrated: true });
      }
    },
    setToken: async (token) => {
      if (!token.trim()) {
        throw new Error('Cannot store an empty session token.');
      }

      await storage.save(token);
      set({ token });
    },
    clearSession: async () => {
      await storage.clear();
      set({ token: null });
    },
  }));
}
