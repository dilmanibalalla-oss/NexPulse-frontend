import type { CheckResultResponse } from '@/shared/api/types';

export const HISTORY_PAGE_SIZE = 20;

export type Incident = {
  id: number;
  startedAt: string;
  recoveredAt: string | null;
  checkCount: number;
  errorMessage: string | null;
  mayStartEarlier: boolean;
};

export type ResponsePoint = {
  value: number;
  label: string;
  successful: boolean;
};

export function nextHistoryPage(number: number, totalPages: number): number | null {
  const next = number + 1;
  return next < totalPages ? next : null;
}

export function uptimeFromChecks(checks: CheckResultResponse[]): number | null {
  if (checks.length === 0) {
    return null;
  }

  const successful = checks.filter((check) => check.successful).length;
  return Math.round((successful / checks.length) * 100);
}

export function incidentsFromChecks(checks: CheckResultResponse[], hasOlder: boolean): Incident[] {
  const incidents: Incident[] = [];
  let index = 0;

  while (index < checks.length) {
    const current = checks[index];
    if (!current || current.successful) {
      index += 1;
      continue;
    }

    const newestIndex = index;
    while (index < checks.length && !checks[index]?.successful) {
      index += 1;
    }

    const newest = checks[newestIndex];
    const oldest = checks[index - 1];
    if (!newest || !oldest) {
      continue;
    }

    const newer = newestIndex > 0 ? checks[newestIndex - 1] : null;
    incidents.push({
      id: oldest.id,
      startedAt: oldest.checkedAt,
      recoveredAt: newer?.successful ? newer.checkedAt : null,
      checkCount: index - newestIndex,
      errorMessage: newest.errorMessage,
      mayStartEarlier: hasOlder && index === checks.length,
    });
  }

  return incidents;
}

export function responsePoints(checks: CheckResultResponse[]): ResponsePoint[] {
  const timed = [...checks].reverse().filter(hasResponseTime);
  const step = Math.max(1, Math.ceil(timed.length / 5));

  return timed.map((check, index) => ({
    value: check.responseTimeMs,
    label: index % step === 0 || index === timed.length - 1 ? chartLabel(check.checkedAt) : '',
    successful: check.successful,
  }));
}

function hasResponseTime(
  check: CheckResultResponse,
): check is CheckResultResponse & { responseTimeMs: number } {
  return check.responseTimeMs != null;
}

function chartLabel(value: string): string {
  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    return '';
  }

  const date = new Date(time);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
