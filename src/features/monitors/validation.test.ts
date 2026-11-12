import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hasMonitorErrors, validateMonitor } from './validation.ts';

const valid = {
  name: 'API',
  url: 'https://example.com/health',
  intervalSeconds: '30',
  enabled: true,
};

describe('validateMonitor', () => {
  it('accepts a website inside the API limits', () => {
    assert.deepEqual(validateMonitor(valid), {});
    assert.equal(hasMonitorErrors({}), false);
  });

  it('rejects a missing name, a non-http URL, and an interval outside 1 to 86400', () => {
    const errors = validateMonitor({
      name: ' ',
      url: 'ftp://example.com',
      intervalSeconds: '0',
      enabled: true,
    });

    assert.equal(errors.name, 'Enter a name.');
    assert.equal(errors.url, 'Enter an http or https URL.');
    assert.match(errors.intervalSeconds ?? '', /1 to 86400/);
    assert.equal(hasMonitorErrors(errors), true);
  });

  it('rejects values longer than the API allows', () => {
    const errors = validateMonitor({
      ...valid,
      name: 'a'.repeat(121),
      url: `https://example.com/${'a'.repeat(2048)}`,
      intervalSeconds: '86401',
    });

    assert.match(errors.name ?? '', /120/);
    assert.match(errors.url ?? '', /2048/);
    assert.match(errors.intervalSeconds ?? '', /86400/);
  });
});
