import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  hasFieldErrors,
  validateLogin,
  validateRegistration,
} from './validation.ts';

describe('validateLogin', () => {
  it('accepts a trimmed email and a password inside the server limits', () => {
    assert.deepEqual(
      validateLogin({ email: '  ada@example.com  ', password: 'a'.repeat(PASSWORD_MIN_LENGTH) }),
      {},
    );
    assert.equal(
      hasFieldErrors(
        validateLogin({ email: 'ada@example.com', password: 'a'.repeat(PASSWORD_MAX_LENGTH) }),
      ),
      false,
    );
  });

  it('rejects a missing email, a malformed email, and a short or blank password', () => {
    assert.equal(validateLogin({ email: ' ', password: ' ' }).email, 'Email is required.');
    assert.equal(
      validateLogin({ email: 'ada@', password: 'long-enough' }).email,
      'Enter a valid email address.',
    );
    assert.equal(
      validateLogin({ email: 'ada@example.com', password: 'a'.repeat(PASSWORD_MIN_LENGTH - 1) })
        .password,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    );
    assert.equal(
      validateLogin({ email: 'ada@example.com', password: ' '.repeat(PASSWORD_MIN_LENGTH) })
        .password,
      'Password is required.',
    );
  });

  it('rejects values longer than the API allows', () => {
    const longEmail = `${'a'.repeat(EMAIL_MAX_LENGTH)}@example.com`;

    assert.match(
      validateLogin({ email: longEmail, password: 'long-enough' }).email ?? '',
      /254 characters or fewer/,
    );
    assert.match(
      validateLogin({ email: 'ada@example.com', password: 'a'.repeat(PASSWORD_MAX_LENGTH + 1) })
        .password ?? '',
      /72 characters or fewer/,
    );
  });
});

describe('validateRegistration', () => {
  it('requires a name along with email and password', () => {
    const errors = validateRegistration({ name: '   ', email: 'not-an-email', password: 'short' });

    assert.equal(errors.name, 'Name is required.');
    assert.equal(errors.email, 'Enter a valid email address.');
    assert.match(errors.password ?? '', /at least 8 characters/);
  });

  it('accepts a name at the length limit and rejects one past it', () => {
    const email = 'ada@example.com';
    const password = 'a'.repeat(PASSWORD_MIN_LENGTH);

    assert.deepEqual(
      validateRegistration({ name: ` ${'A'.repeat(NAME_MAX_LENGTH)} `, email, password }),
      {},
    );
    assert.match(
      validateRegistration({ name: 'A'.repeat(NAME_MAX_LENGTH + 1), email, password }).name ?? '',
      /120 characters or fewer/,
    );
  });
});
