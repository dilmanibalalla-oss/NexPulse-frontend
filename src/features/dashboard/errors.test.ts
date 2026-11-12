import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dashboardErrorMessage } from './errors.ts';

describe('dashboardErrorMessage', () => {
  it('uses a short server message', () => {
    const message = dashboardErrorMessage({
      isAxiosError: true,
      response: { status: 401, data: { message: 'Invalid token', token: 'must-not-surface' } },
    });

    assert.equal(message, 'Invalid token');
    assert.equal(message.includes('must-not-surface'), false);
  });

  it('describes a connection failure without the client error text', () => {
    const message = dashboardErrorMessage({
      isAxiosError: true,
      code: 'ERR_NETWORK',
      message: 'Network Error http://localhost:8080/api/monitors',
    });

    assert.equal(message, 'Could not reach the server. Check your connection and try again.');
  });

  it('hides unexpected client errors', () => {
    assert.equal(
      dashboardErrorMessage(new Error('secret internals')),
      'The dashboard could not be loaded. Try again.',
    );
  });
});
