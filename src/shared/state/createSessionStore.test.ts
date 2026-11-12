import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createSessionStore, type TokenStorage } from './createSessionStore.ts';

function memoryStorage(
  initial: string | null = null,
): TokenStorage & { current: () => string | null } {
  let value = initial;
  return {
    current: () => value,
    read: async () => value,
    save: async (token) => {
      value = token;
    },
    clear: async () => {
      value = null;
    },
  };
}

describe('session store', () => {
  it('restores a saved token when the app opens again', async () => {
    const storage = memoryStorage();
    const first = createSessionStore(storage);
    await first.getState().setToken('session-token');

    const reopened = createSessionStore(storage);
    await reopened.getState().hydrate();

    assert.equal(reopened.getState().hydrated, true);
    assert.equal(reopened.getState().token, 'session-token');
  });

  it('stays signed out when storage has no token', async () => {
    const store = createSessionStore(memoryStorage('   '));
    await store.getState().hydrate();

    assert.equal(store.getState().token, null);
    assert.equal(store.getState().hydrated, true);
  });

  it('clears the saved token on logout', async () => {
    const storage = memoryStorage('session-token');
    const store = createSessionStore(storage);
    await store.getState().hydrate();
    await store.getState().clearSession();

    const reopened = createSessionStore(storage);
    await reopened.getState().hydrate();

    assert.equal(storage.current(), null);
    assert.equal(reopened.getState().token, null);
  });

  it('refuses to store a blank token', async () => {
    const storage = memoryStorage();
    const store = createSessionStore(storage);

    await assert.rejects(() => store.getState().setToken('   '), /empty session token/);
    assert.equal(storage.current(), null);
    assert.equal(store.getState().token, null);
  });
});
