import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bearerValue, shouldEndSession } from './interceptors.ts';

describe('API interceptors', () => {
  it('sends the stored token as a bearer credential', () => {
    assert.equal(bearerValue('session-token'), 'Bearer session-token');
  });

  it('ends the session when a protected request is unauthorized', () => {
    assert.equal(shouldEndSession(401, '/api/monitors', 'session-token'), true);
    assert.equal(
      shouldEndSession(401, 'http://localhost:8080/api/monitors', 'session-token'),
      true,
    );
  });

  it('keeps a failed sign-in from clearing another session', () => {
    assert.equal(shouldEndSession(401, '/api/auth/login', 'session-token'), false);
    assert.equal(shouldEndSession(401, '/api/auth/register', null), false);
    assert.equal(shouldEndSession(401, '/api/monitors', null), false);
    assert.equal(shouldEndSession(500, '/api/monitors', 'session-token'), false);
  });
});
