import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toApiError } from './errors.ts';

describe('toApiError', () => {
  it('keeps field messages from a validation response', () => {
    const error = toApiError({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          message: 'Validation failed',
          fields: { url: ' must be a valid URL ', note: '   ' },
        },
      },
    });

    assert.equal(error.status, 400);
    assert.equal(error.message, 'Validation failed');
    assert.deepEqual(error.fieldErrors, { url: 'must be a valid URL' });
  });
});
