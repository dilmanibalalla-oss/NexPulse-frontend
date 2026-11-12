import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ApiClient } from '../http.ts';
import { loadDashboard } from './dashboard.ts';

const monitor = {
  id: 4,
  name: 'API',
  url: 'https://example.com/health',
  intervalSeconds: 30,
  status: 'UP',
  lastStatusCode: 200,
  lastResponseTime: 120,
  lastCheckedAt: '2026-11-12T12:00:00Z',
  enabled: true,
  createdAt: '2026-11-12T11:00:00Z',
  ownerId: 1,
};

describe('dashboard API', () => {
  it('summarizes the monitor list from the monitors endpoint', async () => {
    let calls = 0;
    const api: ApiClient = {
      get: async (url) => {
        calls += 1;
        assert.equal(url, '/api/monitors');
        return {
          status: 200,
          data: [
            monitor,
            { ...monitor, id: 5, name: 'Down', status: 'DOWN', lastResponseTime: 80 },
          ],
        };
      },
      post: async () => ({ status: 200, data: null }),
      put: async () => ({ status: 200, data: null }),
      delete: async () => ({ status: 204, data: null }),
    };

    const summary = await loadDashboard(api);

    assert.equal(calls, 1);
    assert.equal(summary.total, 2);
    assert.equal(summary.up, 1);
    assert.equal(summary.down, 1);
    assert.equal(summary.uptimePercent, 50);
    assert.equal(summary.averageResponseTimeMs, 100);
  });
});
