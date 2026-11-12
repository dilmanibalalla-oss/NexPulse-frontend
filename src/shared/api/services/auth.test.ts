import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AuthRequestError } from '../../../features/auth/errors.ts';
import type { ApiClient } from '../http.ts';
import { loginAccount, registerAccount } from './auth.ts';

const user = {
  id: 7,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  createdAt: '2026-11-12T12:00:00Z',
};

function client(post: ApiClient['post']): ApiClient {
  return {
    get: async () => ({ status: 200, data: null }),
    post,
    put: async () => ({ status: 200, data: null }),
    delete: async () => ({ status: 204, data: null }),
  };
}

describe('authentication API', () => {
  it('registers with the account fields and ignores extra response fields', async () => {
    let body: unknown;
    const api = client(async (url, request) => {
      assert.equal(url, '/api/auth/register');
      body = request;
      return { status: 201, data: { ...user, password: 'must-not-leak' } };
    });

    await registerAccount(api, {
      name: ' Ada Lovelace ',
      email: ' ada@example.com ',
      password: 'correct horse',
    });

    assert.deepEqual(body, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'correct horse',
    });
  });

  it('returns the token from a successful sign-in', async () => {
    const api = client(async (url, request) => {
      assert.equal(url, '/api/auth/login');
      assert.deepEqual(request, { email: 'ada@example.com', password: 'correct horse' });
      return {
        status: 200,
        data: {
          token: 'session-token',
          expiresAt: '2026-11-13T12:00:00Z',
          user,
          passwordHash: 'must-not-leak',
        },
      };
    });

    const token = await loginAccount(api, {
      email: ' ada@example.com ',
      password: 'correct horse',
    });

    assert.equal(token, 'session-token');
  });

  it('reports incorrect credentials from the server message', async () => {
    const api = client(async () => {
      throw {
        isAxiosError: true,
        response: { status: 401, data: { message: 'Invalid email or password' } },
      };
    });

    await assert.rejects(
      () => loginAccount(api, { email: 'ada@example.com', password: 'wrong-password' }),
      (error: unknown) => {
        assert.ok(error instanceof AuthRequestError);
        assert.equal(error.status, 401);
        assert.equal(error.message, 'Invalid email or password');
        return true;
      },
    );
  });

  it('reports a network failure and a timeout', async () => {
    const offline = client(async () => {
      throw { isAxiosError: true, code: 'ERR_NETWORK' };
    });
    const timedOut = client(async () => {
      throw { isAxiosError: true, code: 'ECONNABORTED' };
    });

    await assert.rejects(
      () =>
        registerAccount(offline, {
          name: 'Ada',
          email: 'ada@example.com',
          password: 'correct horse',
        }),
      /Could not reach the server/,
    );
    await assert.rejects(
      () => loginAccount(timedOut, { email: 'ada@example.com', password: 'correct horse' }),
      /timed out/,
    );
  });
});
