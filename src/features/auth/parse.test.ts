import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseAuthTokenResponse, parseRegisteredUser } from './parse.ts';

const user = {
  id: 4,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  createdAt: '2026-11-12T12:00:00Z',
};

describe('parseRegisteredUser', () => {
  it('keeps the public profile fields', () => {
    assert.deepEqual(parseRegisteredUser({ ...user, passwordHash: 'must-not-leak' }), user);
  });

  it('rejects a body that is missing an account field', () => {
    assert.equal(parseRegisteredUser({ ...user, id: 0 }), null);
    assert.equal(parseRegisteredUser({ ...user, email: ' ' }), null);
    assert.equal(parseRegisteredUser(null), null);
  });
});

describe('parseAuthTokenResponse', () => {
  it('returns the token and profile and drops credential fields', () => {
    const parsed = parseAuthTokenResponse({
      token: ' header.payload.signature ',
      expiresAt: '2026-11-12T12:15:00Z',
      password: 'must-not-leak',
      user: { ...user, passwordHash: 'must-not-leak' },
    });

    assert.deepEqual(parsed, {
      token: 'header.payload.signature',
      expiresAt: '2026-11-12T12:15:00Z',
      user,
    });
    assert.equal(JSON.stringify(parsed).includes('must-not-leak'), false);
  });

  it('rejects a missing, blank, or unstructured token', () => {
    assert.equal(parseAuthTokenResponse({ expiresAt: '2026-11-12T12:15:00Z', user }), null);
    assert.equal(
      parseAuthTokenResponse({ token: '   ', expiresAt: '2026-11-12T12:15:00Z', user }),
      null,
    );
    assert.equal(
      parseAuthTokenResponse({ token: 'not a token', expiresAt: '2026-11-12T12:15:00Z', user }),
      null,
    );
    assert.equal(
      parseAuthTokenResponse({ token: 'header.payload.signature', expiresAt: 'soon', user }),
      null,
    );
  });
});
