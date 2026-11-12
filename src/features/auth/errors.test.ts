import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AuthRequestError, presentAuthError } from './errors.ts';

describe('presentAuthError', () => {
  it('shows the server message for an invalid login', () => {
    const presented = presentAuthError({
      isAxiosError: true,
      response: {
        status: 401,
        data: {
          message: 'Invalid email or password',
          password: 'must-not-surface',
        },
      },
    });

    assert.equal(presented.message, 'Invalid email or password');
    assert.deepEqual(presented.fieldErrors, {});
    assert.equal(JSON.stringify(presented).includes('must-not-surface'), false);
  });

  it('maps validation fields and hides the generic banner', () => {
    const presented = presentAuthError({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: 'Validation failed',
          fields: {
            email: 'must be a well-formed email address',
            unknown: 'ignore me',
            name: 12,
          },
        },
      },
    });

    assert.equal(presented.message, null);
    assert.deepEqual(presented.fieldErrors, {
      email: 'must be a well-formed email address',
    });
  });

  it('shows a conflict on the form', () => {
    const presented = presentAuthError({
      isAxiosError: true,
      response: {
        status: 409,
        data: { message: 'An account with that email already exists' },
      },
    });

    assert.equal(presented.message, 'An account with that email already exists');
  });

  it('describes network failures without using the client error text', () => {
    const timedOut = presentAuthError({
      isAxiosError: true,
      code: 'ECONNABORTED',
      message: 'timeout of 15000ms exceeded',
    });
    const offline = presentAuthError({
      isAxiosError: true,
      code: 'ERR_NETWORK',
      message: 'Network Error',
    });
    const unknown = presentAuthError(new Error('secret internals'));

    assert.match(timedOut.message ?? '', /timed out/);
    assert.match(offline.message ?? '', /reach the server/);
    assert.equal(unknown.message, 'Something went wrong. Try again.');
    assert.equal(JSON.stringify(unknown).includes('secret internals'), false);
  });

  it('keeps an explicit session error', () => {
    const presented = presentAuthError(
      new AuthRequestError('Could not save your session on this device.', null),
    );

    assert.equal(presented.message, 'Could not save your session on this device.');
  });
});
