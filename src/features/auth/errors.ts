import { isAxiosError } from 'axios';

import type { FieldErrors } from './validation';

const AUTH_FIELDS = ['name', 'email', 'password'] as const;

export class AuthRequestError extends Error {
  readonly status: number | null;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, status: number | null, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = 'AuthRequestError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function toAuthRequestError(error: unknown): AuthRequestError {
  if (error instanceof AuthRequestError) {
    return error;
  }

  if (!isAxiosError(error)) {
    return new AuthRequestError('Something went wrong. Try again.', null);
  }

  return authErrorFromResponse(error.response?.status ?? null, error.response?.data, error.code);
}

export function presentAuthError(error: unknown): {
  message: string | null;
  fieldErrors: FieldErrors;
} {
  const authError = toAuthRequestError(error);
  const hasFields = Object.values(authError.fieldErrors).some(
    (message) => typeof message === 'string' && message.length > 0,
  );

  return {
    message: authError.status === 400 && hasFields ? null : authError.message,
    fieldErrors: authError.fieldErrors,
  };
}

function authErrorFromResponse(
  status: number | null,
  data: unknown,
  code?: string,
): AuthRequestError {
  const message = readMessage(data);
  const fieldErrors = readFieldErrors(data);

  if (message) {
    return new AuthRequestError(message, status, fieldErrors);
  }

  if (code === 'ECONNABORTED') {
    return new AuthRequestError(
      'The request timed out. Check your connection and try again.',
      status,
    );
  }

  if (status == null) {
    return new AuthRequestError(
      'Could not reach the server. Check your connection and try again.',
      null,
    );
  }

  return new AuthRequestError('Something went wrong. Try again.', status, fieldErrors);
}

function readMessage(data: unknown): string | null {
  if (!isRecord(data) || typeof data.message !== 'string') {
    return null;
  }

  const message = data.message.trim();
  return message.length > 0 ? message : null;
}

function readFieldErrors(data: unknown): FieldErrors {
  if (!isRecord(data) || !isRecord(data.fields)) {
    return {};
  }

  const fieldErrors: FieldErrors = {};
  for (const field of AUTH_FIELDS) {
    const value = data.fields[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      fieldErrors[field] = value.trim();
    }
  }

  return fieldErrors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
