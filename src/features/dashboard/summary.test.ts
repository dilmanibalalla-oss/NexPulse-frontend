import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { summarizeMonitors } from './summary.ts';
import type { Monitor } from './types.ts';

function monitor(overrides: Partial<Monitor> & Pick<Monitor, 'id' | 'name' | 'status'>): Monitor {
  return {
    url: 'https://example.com',
    intervalSeconds: 60,
    lastStatusCode: null,
    lastResponseTime: null,
    lastCheckedAt: null,
    enabled: true,
    createdAt: '2026-11-12T11:00:00Z',
    ownerId: 1,
    checkType: 'HTTP',
    port: null,
    expectedStatus: null,
    expectedBody: null,
    lastDnsLookupMs: null,
    lastConnectMs: null,
    lastFailureKind: null,
    openIncidentAcknowledgedAt: null,
    ...overrides,
  };
}

describe('summarizeMonitors', () => {
  it('counts websites by status and averages only recorded response times', () => {
    const summary = summarizeMonitors([
      monitor({
        id: 1,
        name: 'Up fast',
        status: 'UP',
        lastResponseTime: 100,
        lastCheckedAt: '2026-11-12T12:00:00Z',
      }),
      monitor({
        id: 2,
        name: 'Up slow',
        status: 'UP',
        lastResponseTime: 300,
        lastCheckedAt: '2026-11-12T12:05:00Z',
      }),
      monitor({
        id: 3,
        name: 'Down',
        status: 'DOWN',
        lastResponseTime: 0,
        lastCheckedAt: '2026-11-12T11:00:00Z',
      }),
      monitor({ id: 4, name: 'Waiting', status: 'UNKNOWN' }),
    ]);

    assert.equal(summary.total, 4);
    assert.equal(summary.up, 2);
    assert.equal(summary.down, 1);
    assert.equal(summary.unknown, 1);
    assert.equal(summary.averageResponseTimeMs, 133);
    assert.equal(summary.uptimePercent, 67);
    assert.deepEqual(
      summary.recent.map((item) => item.name),
      ['Up slow', 'Up fast', 'Down'],
    );
  });

  it('returns an empty summary when there are no websites', () => {
    const summary = summarizeMonitors([]);

    assert.deepEqual(summary, {
      total: 0,
      up: 0,
      down: 0,
      unknown: 0,
      averageResponseTimeMs: null,
      uptimePercent: null,
      recent: [],
    });
  });

  it('keeps only the ten most recent checks', () => {
    const monitors = Array.from({ length: 12 }, (_, index) =>
      monitor({
        id: index + 1,
        name: `Site ${index + 1}`,
        status: 'UP',
        lastResponseTime: 10,
        lastCheckedAt: new Date(Date.UTC(2026, 10, index + 1)).toISOString(),
      }),
    );

    const summary = summarizeMonitors(monitors);

    assert.equal(summary.recent.length, 10);
    assert.equal(summary.recent[0]?.name, 'Site 12');
    assert.equal(summary.recent.at(-1)?.name, 'Site 3');
  });
});
