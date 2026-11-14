import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '../errors.ts';
import type { ApiClient, ApiResponse } from '../http.ts';
import {
  createMonitor,
  deleteMonitor,
  getMonitor,
  listMonitors,
  updateMonitor,
} from './monitors.ts';

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

const write = {
  name: ' API ',
  url: ' https://example.com/health ',
  intervalSeconds: 60,
  enabled: true,
  checkType: 'HTTP' as const,
  port: null,
  expectedStatus: null,
  expectedBody: null,
  httpMethod: null,
  maxResponseTimeMs: null,
  jsonField: null,
  expectedJsonValue: null,
  requestBody: null,
  bearerToken: null,
  headers: null,
  removeBearerToken: false,
  removeHeaders: false,
};

function client(impl: Partial<ApiClient>): ApiClient {
  const unused = async (): Promise<ApiResponse> => {
    throw new Error('Unexpected request.');
  };
  return {
    get: impl.get ?? unused,
    post: impl.post ?? unused,
    put: impl.put ?? unused,
    delete: impl.delete ?? unused,
  };
}

describe('monitor API', () => {
  it('loads the owner monitor list', async () => {
    const api = client({
      get: async (url) => {
        assert.equal(url, '/api/monitors');
        return { status: 200, data: [monitor] };
      },
    });

    const monitors = await listMonitors(api);
    assert.equal(monitors[0]?.name, 'API');
    assert.equal(monitors[0]?.intervalSeconds, 30);
  });

  it('creates, reads, updates, and deletes a monitor on its resource path', async () => {
    const calls: string[] = [];
    const api = client({
      post: async (url, body) => {
        calls.push(url);
        assert.deepEqual(body, {
          name: 'API',
          url: 'https://example.com/health',
          intervalSeconds: 60,
          enabled: true,
          checkType: 'HTTP',
          port: null,
          expectedStatus: null,
          expectedBody: null,
          httpMethod: null,
          maxResponseTimeMs: null,
          jsonField: null,
          expectedJsonValue: null,
          requestBody: null,
          bearerToken: '',
          headers: [],
          removeBearerToken: true,
          removeHeaders: true,
        });
        return { status: 201, data: monitor };
      },
      get: async (url) => {
        calls.push(url);
        return { status: 200, data: monitor };
      },
      put: async (url, body) => {
        calls.push(url);
        assert.equal((body as { enabled: boolean }).enabled, false);
        return { status: 200, data: { ...monitor, enabled: false } };
      },
      delete: async (url) => {
        calls.push(url);
        return { status: 204, data: null };
      },
    });

    await createMonitor(api, write);
    await getMonitor(api, 4);
    await updateMonitor(api, 4, { ...write, enabled: false });
    await deleteMonitor(api, 4);

    assert.deepEqual(calls, [
      '/api/monitors',
      '/api/monitors/4',
      '/api/monitors/4',
      '/api/monitors/4',
    ]);
  });

  it('turns a timeout and an expired session into API errors', async () => {
    const timedOut = client({
      get: async () => {
        throw { isAxiosError: true, code: 'ECONNABORTED' };
      },
    });
    const expired = client({
      get: async () => {
        throw { isAxiosError: true, response: { status: 401, data: {} } };
      },
    });

    await assert.rejects(
      () => listMonitors(timedOut),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.match(error.message, /timed out/);
        return true;
      },
    );
    await assert.rejects(
      () => listMonitors(expired),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, 401);
        assert.match(error.message, /session has expired/);
        return true;
      },
    );
  });
});
