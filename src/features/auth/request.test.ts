import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { loginRequestBody, registerRequestBody } from './request.ts';

describe('auth request bodies', () => {
  it('trims the email and leaves the password unchanged', () => {
    assert.deepEqual(
      loginRequestBody({ email: '  Ada@Example.com  ', password: '  keep spaces  ' }),
      {
        email: 'Ada@Example.com',
        password: '  keep spaces  ',
      },
    );
  });

  it('sends only the registration fields the API accepts', () => {
    const body = registerRequestBody({
      name: '  Ada Lovelace  ',
      email: ' ada@example.com ',
      password: 'not-trimmed',
    });

    assert.deepEqual(body, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'not-trimmed',
    });
    assert.deepEqual(Object.keys(body), ['name', 'email', 'password']);
  });
});
