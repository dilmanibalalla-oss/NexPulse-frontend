import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveApiUrl } from './env.ts';

describe('resolveApiUrl', () => {
  it('falls back to the local backend when the variable is missing', () => {
    assert.equal(resolveApiUrl(undefined), 'http://localhost:8080');
    assert.equal(resolveApiUrl('   '), 'http://localhost:8080');
  });

  it('keeps an absolute origin and drops a trailing slash', () => {
    assert.equal(resolveApiUrl('http://10.0.2.2:8080/'), 'http://10.0.2.2:8080');
  });

  it('rejects a value that is not an http(s) URL', () => {
    assert.throws(() => resolveApiUrl('/api'), /absolute URL/);
    assert.throws(() => resolveApiUrl('ftp://localhost:8080'), /http or https/);
  });
});
