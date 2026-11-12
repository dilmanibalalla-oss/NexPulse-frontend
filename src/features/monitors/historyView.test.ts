import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  incidentsFromChecks,
  nextHistoryPage,
  responsePoints,
  uptimeFromChecks,
} from './historyView.ts';
import type { CheckResultResponse } from '../../shared/api/types.ts';

function check(
  id: number,
  successful: boolean,
  minute: number,
  responseTimeMs: number | null,
): CheckResultResponse {
  return {
    id,
    monitorId: 4,
    checkedAt: `2026-11-12T12:${String(minute).padStart(2, '0')}:00Z`,
    successful,
    statusCode: successful ? 200 : 503,
    responseTimeMs,
    errorMessage: successful ? null : 'Service unavailable',
  };
}

describe('check history view', () => {
  it('pages forward only while the API reports more pages', () => {
    assert.equal(nextHistoryPage(0, 3), 1);
    assert.equal(nextHistoryPage(2, 3), null);
  });

  it('calculates uptime from stored checks and leaves an empty page blank', () => {
    assert.equal(uptimeFromChecks([]), null);
    assert.equal(
      uptimeFromChecks([check(1, true, 1, 10), check(2, false, 2, 20), check(3, true, 3, 30)]),
      67,
    );
  });

  it('groups failed checks into incidents without inventing recoveries', () => {
    const checks = [
      check(5, false, 50, 40),
      check(4, false, 40, 30),
      check(3, true, 30, 20),
      check(2, false, 20, null),
      check(1, true, 10, 10),
    ];

    const incidents = incidentsFromChecks(checks, true);

    assert.deepEqual(
      incidents.map((incident) => ({
        id: incident.id,
        recovered: incident.recoveredAt != null,
        checks: incident.checkCount,
        earlier: incident.mayStartEarlier,
      })),
      [
        { id: 4, recovered: false, checks: 2, earlier: false },
        { id: 2, recovered: true, checks: 1, earlier: false },
      ],
    );
    assert.equal(incidents[0]?.errorMessage, 'Service unavailable');
    assert.equal(incidents[1]?.recoveredAt, '2026-11-12T12:30:00Z');
  });

  it('plots only checks that recorded a response time', () => {
    const points = responsePoints([check(2, false, 20, null), check(1, true, 10, 125)]);

    assert.deepEqual(points, [{ value: 125, label: '12:10', successful: true }]);
  });
});
