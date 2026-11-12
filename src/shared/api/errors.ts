import { isAxiosError } from 'axios';

export class ApiError extends Error {
  readonly status: number | null;
  readonly fieldErrors: Readonly<Record<string, string>>;

  constructor(
    message: string,
    status: number | null,
    fieldErrors: Readonly<Record<string, string>> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (!isAxiosError(error)) {
    return new ApiError('The request could not be completed. Try again.', null);
  }

  const status = error.response?.status ?? null;
  const message = readMessage(error.response?.data);
  const fieldErrors = readFieldErrors(error.response?.data);

  if (error.code === 'ECONNABORTED') {
    return new ApiError('The request timed out. Check your connection and try again.', status);
  }

  if (error.response == null) {
    return new ApiError('Could not reach the server. Check your connection and try again.', null);
  }

  if (status === 401) {
    return new ApiError(message ?? 'Your session has expired. Sign in again.', status, fieldErrors);
  }

  return new ApiError(
    message ?? 'The request could not be completed. Try again.',
    status,
    fieldErrors,
  );
}

function readFieldErrors(data: unknown): Record<string, string> {
  if (!isRecord(data) || !isRecord(data.fields)) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};
  for (const [field, value] of Object.entries(data.fields)) {
    if (typeof value === 'string' && value.trim()) {
      fieldErrors[field] = value.trim();
    }
  }

  return fieldErrors;
}

function readMessage(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return null;
  }

  const message = 'message' in data ? data.message : null;
  if (typeof message !== 'string') {
    return null;
  }

  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 180) {
    return null;
  }

  return trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
