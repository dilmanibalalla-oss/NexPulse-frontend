import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseMonitorList } from './parse.ts';

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

describe('parseMonitorList', () => {
  it('keeps the fields the dashboard shows and drops the rest', () => {
    assert.deepEqual(parseMonitorList([{ ...monitor, password: 'must-not-leak' }]), [
      {
        id: 4,
        name: 'API',
        url: 'https://example.com/health',
        status: 'UP',
        lastStatusCode: 200,
        lastResponseTime: 120,
        lastCheckedAt: '2026-11-12T12:00:00Z',
        enabled: true,
      },
    ]);
  });

  it('accepts a website that has not been checked', () => {
    const parsed = parseMonitorList([
      {
        ...monitor,
        status: 'UNKNOWN',
        lastStatusCode: null,
        lastResponseTime: null,
        lastCheckedAt: null,
      },
    ]);

    assert.equal(parsed?.[0]?.status, 'UNKNOWN');
    assert.equal(parsed?.[0]?.lastResponseTime, null);
    assert.equal(parsed?.[0]?.lastCheckedAt, null);
  });

  it('rejects a payload that is not the monitor list', () => {
    assert.equal(parseMonitorList({ content: [monitor] }), null);
    assert.equal(parseMonitorList([{ ...monitor, status: 'MAYBE' }]), null);
    assert.equal(parseMonitorList([{ ...monitor, lastResponseTime: -1 }]), null);
    assert.equal(parseMonitorList(null), null);
  });
});
