import type { CheckType } from '@/features/dashboard/types';

export const MONITOR_NAME_MAX = 120;
export const MONITOR_URL_MAX = 2048;
export const MONITOR_INTERVALS = [60, 300, 600] as const;
export const MONITOR_CHECK_TYPES = ['HTTP', 'HTTPS', 'REST', 'TCP', 'DNS'] as const;

export type MonitorField =
  | 'name'
  | 'url'
  | 'intervalSeconds'
  | 'port'
  | 'expectedStatus'
  | 'expectedBody';
export type MonitorFieldErrors = Partial<Record<MonitorField, string>>;

export type MonitorFormValues = {
  name: string;
  url: string;
  intervalSeconds: string;
  enabled: boolean;
  checkType: CheckType;
  port: string;
  expectedStatus: string;
  expectedBody: string;
};

export function validateMonitor(values: MonitorFormValues): MonitorFieldErrors {
  const errors: MonitorFieldErrors = {};
  const name = values.name.trim();
  const url = values.url.trim();
  const checkType = values.checkType;

  if (!name) {
    errors.name = 'Enter a name.';
  } else if (name.length > MONITOR_NAME_MAX) {
    errors.name = `Name must be ${MONITOR_NAME_MAX} characters or fewer.`;
  }

  if (!url) {
    errors.url = checkType === 'TCP' || checkType === 'DNS' ? 'Enter a host.' : 'Enter a URL.';
  } else if (url.length > MONITOR_URL_MAX) {
    errors.url = `${checkType === 'TCP' || checkType === 'DNS' ? 'Host' : 'URL'} must be ${MONITOR_URL_MAX} characters or fewer.`;
  } else if (checkType === 'HTTPS' && !isHttpsUrl(url)) {
    errors.url = 'Enter an https URL.';
  } else if (
    (checkType === 'HTTP' || checkType === 'REST') &&
    !isHttpUrl(url)
  ) {
    errors.url = 'Enter an http or https URL.';
  } else if ((checkType === 'TCP' || checkType === 'DNS') && !isHostOrUrl(url)) {
    errors.url = 'Enter a hostname or an http or https URL.';
  }

  if (!MONITOR_INTERVALS.some((interval) => String(interval) === values.intervalSeconds.trim())) {
    errors.intervalSeconds = 'Choose 1, 5, or 10 minutes.';
  }

  if (checkType === 'TCP' && !isPort(values.port)) {
    errors.port = 'Enter a port from 1 to 65535.';
  }

  if (checkType === 'REST' && values.expectedStatus.trim() && !isExpectedStatus(values.expectedStatus)) {
    errors.expectedStatus = 'Enter a status from 100 to 599.';
  }

  if (checkType === 'REST' && values.expectedBody.trim().length > 200) {
    errors.expectedBody = 'Expected text must be 200 characters or fewer.';
  }

  return errors;
}

export function hasMonitorErrors(errors: MonitorFieldErrors): boolean {
  return Object.values(errors).some((message) => Boolean(message));
}

export function normalizeMonitorUrl(checkType: CheckType, url: string): string {
  const trimmed = url.trim();
  if ((checkType === 'TCP' || checkType === 'DNS') && !trimmed.includes('://')) {
    return `http://${trimmed}`;
  }

  return trimmed;
}

function isPort(value: string): boolean {
  if (!/^\d+$/.test(value.trim())) {
    return false;
  }

  const port = Number(value);
  return port >= 1 && port <= 65535;
}

function isExpectedStatus(value: string): boolean {
  if (!/^\d+$/.test(value.trim())) {
    return false;
  }

  const status = Number(value);
  return status >= 100 && status <= 599;
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.length > 0;
  } catch {
    return false;
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

function isHostOrUrl(value: string): boolean {
  if (value.includes('://')) {
    return isHttpUrl(value);
  }

  return /^[A-Za-z0-9.-]+$/.test(value) && value.includes('.') === false
    ? value.length > 0
    : /^[A-Za-z0-9.-]+$/.test(value);
}
