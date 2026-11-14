import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hasMonitorErrors, validateMonitor } from './validation.ts';

const valid = {
  name: 'API',
  url: 'https://example.com/health',
  intervalSeconds: '60',
  enabled: true,
  checkType: 'HTTP' as const,
  port: '',
  expectedStatus: '',
  expectedBody: '',
  httpMethod: 'GET' as const,
  maxResponseTimeMs: '',
  jsonField: '',
  expectedJsonValue: '',
  requestBody: '',
  bearerToken: '',
  headerName: '',
  headerValue: '',
};

describe('validateMonitor', () => {
  it('accepts an http check on a 1, 5, or 10 minute interval', () => {
    assert.deepEqual(validateMonitor(valid), {});
    assert.deepEqual(validateMonitor({ ...valid, intervalSeconds: '300' }), {});
    assert.deepEqual(validateMonitor({ ...valid, intervalSeconds: '600' }), {});
    assert.equal(hasMonitorErrors({}), false);
  });

  it('rejects a missing name, a non-http URL, and an interval outside the choices', () => {
    const errors = validateMonitor({
      ...valid,
      name: ' ',
      url: 'ftp://example.com',
      intervalSeconds: '30',
    });

    assert.equal(errors.name, 'Enter a name.');
    assert.equal(errors.url, 'Enter an http or https URL.');
    assert.equal(errors.intervalSeconds, 'Choose 1, 5, or 10 minutes.');
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
    assert.equal(errors.intervalSeconds, 'Choose 1, 5, or 10 minutes.');
  });

  it('requires https for an HTTPS check and a port for TCP', () => {
    const https = validateMonitor({ ...valid, checkType: 'HTTPS', url: 'http://example.com' });
    const tcp = validateMonitor({ ...valid, checkType: 'TCP', url: 'example.com', port: '0' });

    assert.equal(https.url, 'Enter an https URL.');
    assert.equal(tcp.port, 'Enter a port from 1 to 65535.');
    assert.deepEqual(validateMonitor({ ...valid, checkType: 'TCP', url: 'example.com', port: '443' }), {});
  });
});
