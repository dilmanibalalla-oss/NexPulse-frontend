import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Monitor } from '../dashboard/types.ts';
import { observeMonitors, parseAlertCursor } from './observeMonitors.ts';

function monitor(id: number, status: Monitor['status'], name = `Site ${id}`): Monitor {
  return {
    id,
    name,
    url: `https://example.com/${id}`,
    intervalSeconds: 60,
    status,
    lastStatusCode: status === 'UNKNOWN' ? null : status === 'UP' ? 200 : 503,
    lastResponseTime: status === 'UNKNOWN' ? null : 40,
    lastCheckedAt: status === 'UNKNOWN' ? null : '2026-11-12T12:00:00Z',
    enabled: true,
    createdAt: '2026-11-12T00:00:00Z',
    ownerId: 1,
  };
}

describe('monitor alert transitions', () => {
  const enabled = { downEnabled: true, recoveryEnabled: true };

  it('records the first stored statuses without sending an alert', () => {
    const result = observeMonitors(null, [monitor(4, 'DOWN', 'API')], enabled);

    assert.deepEqual(result.alerts, []);
    assert.deepEqual(result.cursor, { '4': 'DOWN' });
  });

  it('alerts once when a known website changes to down and once when it recovers', () => {
    const down = observeMonitors({ '4': 'UP' }, [monitor(4, 'DOWN', 'API')], enabled);
    const stillDown = observeMonitors(down.cursor, [monitor(4, 'DOWN', 'API')], enabled);
    const recovered = observeMonitors(stillDown.cursor, [monitor(4, 'UP', 'API')], enabled);
    const stillUp = observeMonitors(recovered.cursor, [monitor(4, 'UP', 'API')], enabled);

    assert.deepEqual(down.alerts, [{ monitorId: 4, kind: 'down', name: 'API' }]);
    assert.deepEqual(stillDown.alerts, []);
    assert.deepEqual(recovered.alerts, [{ monitorId: 4, kind: 'recovery', name: 'API' }]);
    assert.deepEqual(stillUp.alerts, []);
  });

  it('follows the saved switches and ignores a website seen for the first time', () => {
    const result = observeMonitors(
      { '4': 'UP' },
      [monitor(4, 'DOWN', 'API'), monitor(8, 'DOWN', 'New')],
      { downEnabled: false, recoveryEnabled: false },
    );

    assert.deepEqual(result.alerts, []);
    assert.deepEqual(result.cursor, { '4': 'DOWN', '8': 'DOWN' });
  });

  it('does not treat unknown as down or as a recovery', () => {
    const unknown = observeMonitors({ '4': 'UP' }, [monitor(4, 'UNKNOWN')], enabled);
    const recovered = observeMonitors({ '4': 'DOWN' }, [monitor(4, 'UNKNOWN')], enabled);

    assert.deepEqual(unknown.alerts, []);
    assert.deepEqual(recovered.alerts, []);
  });

  it('drops websites that are no longer returned', () => {
    const result = observeMonitors({ '4': 'DOWN', '8': 'UP' }, [monitor(8, 'UP')], enabled);

    assert.deepEqual(result.cursor, { '8': 'UP' });
    assert.deepEqual(result.alerts, []);
  });

  it('accepts only stored status values in a cursor', () => {
    assert.deepEqual(parseAlertCursor({ '4': 'DOWN' }), { '4': 'DOWN' });
    assert.equal(parseAlertCursor({ '4': 'MAYBE' }), null);
    assert.equal(parseAlertCursor(['DOWN']), null);
  });
});
