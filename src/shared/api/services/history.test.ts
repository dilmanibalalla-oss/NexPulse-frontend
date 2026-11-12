import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ApiClient } from '../http.ts';
import { listCheckHistory } from './history.ts';

describe('history API', () => {
  it('requests one page of stored checks for a monitor', async () => {
    const api: ApiClient = {
      get: async (url, config) => {
        assert.equal(url, '/api/monitors/4/checks');
        assert.deepEqual(config?.params, { page: 1, size: 20 });
        return {
          status: 200,
          data: {
            content: [
              {
                id: 9,
                monitorId: 4,
                checkedAt: '2026-11-12T12:00:00Z',
                successful: false,
                statusCode: 503,
                responseTimeMs: 40,
                errorMessage: 'Service unavailable',
              },
            ],
            totalElements: 1,
            totalPages: 1,
            number: 1,
            size: 20,
            empty: false,
          },
        };
      },
      post: async () => ({ status: 200, data: null }),
      put: async () => ({ status: 200, data: null }),
      delete: async () => ({ status: 204, data: null }),
    };

    const page = await listCheckHistory(api, 4, 1, 20);
    assert.equal(page.content[0]?.statusCode, 503);
    assert.equal(page.totalElements, 1);
    assert.equal('empty' in page, false);
  });

  it('rejects a payload that is not a check page', async () => {
    const api: ApiClient = {
      get: async () => ({ status: 200, data: { checks: [] } }),
      post: async () => ({ status: 200, data: null }),
      put: async () => ({ status: 200, data: null }),
      delete: async () => ({ status: 204, data: null }),
    };

    await assert.rejects(() => listCheckHistory(api, 4), /unexpected check history/);
  });
});
