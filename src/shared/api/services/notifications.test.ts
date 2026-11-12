import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ApiClient } from '../http.ts';
import {
  getNotificationPreferences,
  registerPushDevice,
  unregisterPushDevice,
  updateNotificationPreferences,
} from './notifications.ts';

describe('notification API', () => {
  it('loads and saves the signed-in user preferences', async () => {
    const calls: string[] = [];
    const api: ApiClient = {
      get: async (url) => {
        calls.push(url);
        return { status: 200, data: { downEnabled: true, recoveryEnabled: false } };
      },
      post: async () => ({ status: 200, data: null }),
      put: async (url, body) => {
        calls.push(url);
        assert.deepEqual(body, { downEnabled: false, recoveryEnabled: true });
        return { status: 200, data: body };
      },
      delete: async () => ({ status: 204, data: null }),
    };

    const loaded = await getNotificationPreferences(api);
    const saved = await updateNotificationPreferences(api, {
      downEnabled: false,
      recoveryEnabled: true,
    });

    assert.deepEqual(loaded, { downEnabled: true, recoveryEnabled: false });
    assert.deepEqual(saved, { downEnabled: false, recoveryEnabled: true });
    assert.deepEqual(calls, ['/api/notifications/preferences', '/api/notifications/preferences']);
  });

  it('registers and removes an Expo token for the current account', async () => {
    let removed = '';
    const api: ApiClient = {
      get: async () => ({ status: 200, data: null }),
      post: async () => ({ status: 200, data: null }),
      put: async (url, body) => {
        assert.equal(url, '/api/notifications/devices');
        assert.deepEqual(body, { token: 'ExponentPushToken[device]', platform: 'ANDROID' });
        return { status: 204, data: null };
      },
      delete: async (url, config) => {
        assert.equal(url, '/api/notifications/devices');
        removed = config?.params?.token ?? '';
        return { status: 204, data: null };
      },
    };

    await registerPushDevice(api, 'ExponentPushToken[device]', 'ANDROID');
    await unregisterPushDevice(api, 'ExponentPushToken[device]');

    assert.equal(removed, 'ExponentPushToken[device]');
  });

  it('rejects an unexpected preference payload', async () => {
    const api: ApiClient = {
      get: async () => ({ status: 200, data: { downEnabled: 'yes' } }),
      post: async () => ({ status: 200, data: null }),
      put: async () => ({ status: 200, data: null }),
      delete: async () => ({ status: 204, data: null }),
    };

    await assert.rejects(() => getNotificationPreferences(api), /unexpected notification settings/);
  });
});
