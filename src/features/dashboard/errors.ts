import { isAxiosError } from 'axios';

export function dashboardErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return 'The dashboard could not be loaded. Try again.';
  }

  const message = readMessage(error.response?.data);
  if (message) {
    return message;
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Check your connection and try again.';
  }

  if (error.response == null) {
    return 'Could not reach the server. Check your connection and try again.';
  }

  return 'The dashboard could not be loaded. Try again.';
}

function readMessage(data: unknown): string | null {
  if (!isRecord(data) || typeof data.message !== 'string') {
    return null;
  }

  const message = data.message.trim();
  if (!message || message.length > 180) {
    return null;
  }

  return message;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
