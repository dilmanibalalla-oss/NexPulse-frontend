import { ApiError, toApiError } from '../errors';
import type { ApiClient } from '../http';
import type { CheckHistoryPage, CheckResultResponse } from '../types';

export type { CheckHistoryPage, CheckResultResponse };

export async function listCheckHistory(
  client: ApiClient,
  monitorId: number,
  page = 0,
  size = 20,
): Promise<CheckHistoryPage> {
  try {
    const response = await client.get(`/api/monitors/${monitorId}/checks`, {
      params: { page, size },
    });
    const history = parseCheckHistoryPage(response.data);
    if (!history) {
      throw new ApiError('The server returned an unexpected check history.', response.status);
    }

    return history;
  } catch (error) {
    throw toApiError(error);
  }
}

export function parseCheckHistoryPage(data: unknown): CheckHistoryPage | null {
  if (!isRecord(data) || !Array.isArray(data.content)) {
    return null;
  }

  if (
    !isCount(data.totalElements) ||
    !isCount(data.totalPages) ||
    !isCount(data.number) ||
    !isCount(data.size)
  ) {
    return null;
  }

  const content: CheckResultResponse[] = [];
  for (const item of data.content) {
    const result = parseCheckResult(item);
    if (!result) {
      return null;
    }
    content.push(result);
  }

  return {
    content,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    number: data.number,
    size: data.size,
  };
}

function parseCheckResult(data: unknown): CheckResultResponse | null {
  if (!isRecord(data)) {
    return null;
  }

  if (!isId(data.id) || !isId(data.monitorId)) {
    return null;
  }

  if (typeof data.checkedAt !== 'string' || Number.isNaN(Date.parse(data.checkedAt))) {
    return null;
  }

  if (typeof data.successful !== 'boolean') {
    return null;
  }

  const statusCode = parseOptionalInt(data.statusCode, 100, 599);
  const responseTimeMs = parseOptionalInt(data.responseTimeMs, 0, Number.MAX_SAFE_INTEGER);
  if (statusCode === undefined || responseTimeMs === undefined) {
    return null;
  }

  if (data.errorMessage != null && typeof data.errorMessage !== 'string') {
    return null;
  }

  return {
    id: data.id,
    monitorId: data.monitorId,
    checkedAt: data.checkedAt,
    successful: data.successful,
    statusCode,
    responseTimeMs,
    errorMessage: typeof data.errorMessage === 'string' ? data.errorMessage : null,
    reachable: typeof data.reachable === 'boolean' ? data.reachable : null,
    assertionsPassed: typeof data.assertionsPassed === 'boolean' ? data.assertionsPassed : null,
  };
}

function parseOptionalInt(value: unknown, min: number, max: number): number | null | undefined {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    return undefined;
  }

  return value;
}

function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
