import type { CheckType, HttpMethod } from '@/features/dashboard/types';

export const MONITOR_NAME_MAX = 120;
export const MONITOR_URL_MAX = 2048;
export const MONITOR_INTERVALS = [60, 300, 600] as const;
export const MONITOR_CHECK_TYPES = ['HTTP', 'HTTPS', 'REST', 'API', 'TCP', 'DNS'] as const;
export const HTTP_METHODS = ['GET', 'POST', 'PUT'] as const;

export type MonitorField =
  | 'name'
  | 'url'
  | 'intervalSeconds'
  | 'port'
  | 'expectedStatus'
  | 'expectedBody'
  | 'maxResponseTimeMs'
  | 'jsonField'
  | 'expectedJsonValue'
  | 'requestBody'
  | 'bearerToken'
  | 'headerName'
  | 'headerValue';
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
  httpMethod: HttpMethod;
  maxResponseTimeMs: string;
  jsonField: string;
  expectedJsonValue: string;
  requestBody: string;
  bearerToken: string;
  headerName: string;
  headerValue: string;
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
    (checkType === 'HTTP' || checkType === 'REST' || checkType === 'API') &&
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

  if (
    (checkType === 'REST' || checkType === 'API') &&
    values.expectedStatus.trim() &&
    !isExpectedStatus(values.expectedStatus)
  ) {
    errors.expectedStatus = 'Enter a status from 100 to 599.';
  }

  if ((checkType === 'REST' || checkType === 'API') && values.expectedBody.trim().length > 200) {
    errors.expectedBody = 'Expected text must be 200 characters or fewer.';
  }

  if (checkType === 'API' && values.maxResponseTimeMs.trim() && !isMaxResponseTime(values.maxResponseTimeMs)) {
    errors.maxResponseTimeMs = 'Enter a maximum from 1 to 120000 milliseconds.';
  }

  if (checkType === 'API' && values.expectedJsonValue.trim() && !values.jsonField.trim()) {
    errors.jsonField = 'Enter the JSON field to compare.';
  } else if (checkType === 'API' && values.jsonField.trim() && !/^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/.test(values.jsonField.trim())) {
    errors.jsonField = 'Use letters, numbers, and dots, such as status or data.status.';
  }

  if (checkType === 'API' && values.expectedJsonValue.trim().length > 200) {
    errors.expectedJsonValue = 'Expected value must be 200 characters or fewer.';
  }

  if (checkType === 'API' && values.requestBody.trim().length > 4000) {
    errors.requestBody = 'Request body must be 4000 characters or fewer.';
  }

  if (checkType === 'API' && values.bearerToken.trim().length > 2000) {
    errors.bearerToken = 'Bearer token must be 2000 characters or fewer.';
  }

  if (checkType === 'API' && (values.headerName.trim() || values.headerValue.trim())) {
    if (!/^[A-Za-z0-9-]+$/.test(values.headerName.trim())) {
      errors.headerName = 'Use a header name such as X-Request-Id.';
    }
    if (!values.headerValue.trim()) {
      errors.headerValue = 'Enter a header value.';
    } else if (values.headerValue.length > 2000 || /[\r\n]/.test(values.headerValue)) {
      errors.headerValue = 'Header value must be one line of 2000 characters or fewer.';
    }
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

function isMaxResponseTime(value: string): boolean {
  if (!/^\d+$/.test(value.trim())) {
    return false;
  }

  const time = Number(value);
  return time >= 1 && time <= 120_000;
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
