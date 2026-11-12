import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatCheckedAt, formatResponseTime, websiteHost } from './format.ts';

describe('formatResponseTime', () => {
  it('formats milliseconds, seconds, and a missing measurement', () => {
    assert.equal(formatResponseTime(null), '—');
    assert.equal(formatResponseTime(0), '0 ms');
    assert.equal(formatResponseTime(850), '850 ms');
    assert.equal(formatResponseTime(1500), '1.5 s');
    assert.equal(formatResponseTime(12_400), '12 s');
  });
});

describe('formatCheckedAt', () => {
  const now = Date.parse('2026-11-12T12:00:00Z');

  it('describes how long ago a check ran', () => {
    assert.equal(formatCheckedAt('2026-11-12T11:59:30Z', now), 'Just now');
    assert.equal(formatCheckedAt('2026-11-12T11:40:00Z', now), '20m ago');
    assert.equal(formatCheckedAt('2026-11-12T09:00:00Z', now), '3h ago');
    assert.equal(formatCheckedAt('2026-11-10T12:00:00Z', now), '2d ago');
  });
});

describe('websiteHost', () => {
  it('shows the host and keeps an unparseable value', () => {
    assert.equal(websiteHost('https://status.example.com/health'), 'status.example.com');
    assert.equal(websiteHost('not a url'), 'not a url');
  });
});
