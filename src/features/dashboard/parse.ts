import type { CheckType, FailureKind, HttpMethod, Monitor, MonitorStatus } from './types';

const MONITOR_STATUSES = ['UP', 'DOWN', 'UNKNOWN'] as const satisfies readonly MonitorStatus[];

export function parseMonitorList(data: unknown): Monitor[] | null {
  if (!Array.isArray(data)) {
    return null;
  }

  const monitors: Monitor[] = [];
  for (const item of data) {
    const monitor = parseMonitor(item);
    if (!monitor) {
      return null;
    }
    monitors.push(monitor);
  }

  return monitors;
}

function parseMonitor(data: unknown): Monitor | null {
  if (!isRecord(data)) {
    return null;
  }

  if (typeof data.id !== 'number' || !Number.isInteger(data.id) || data.id < 1) {
    return null;
  }

  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    return null;
  }

  if (typeof data.url !== 'string' || data.url.trim().length === 0) {
    return null;
  }

  if (!isInterval(data.intervalSeconds) || !isStatus(data.status)) {
    return null;
  }

  const lastStatusCode = parseStatusCode(data.lastStatusCode);
  if (lastStatusCode === undefined) {
    return null;
  }

  const lastResponseTime = parseResponseTime(data.lastResponseTime);
  if (lastResponseTime === undefined) {
    return null;
  }

  const lastCheckedAt = parseCheckedAt(data.lastCheckedAt);
  if (lastCheckedAt === undefined) {
    return null;
  }

  if (typeof data.enabled !== 'boolean') {
    return null;
  }

  if (!isInstant(data.createdAt) || !isId(data.ownerId)) {
    return null;
  }

  const port = parsePort(data.port);
  const expectedStatus = parseStatusCode(data.expectedStatus);
  const lastDnsLookupMs = parseResponseTime(data.lastDnsLookupMs);
  const lastConnectMs = parseResponseTime(data.lastConnectMs);
  const openIncidentAcknowledgedAt = parseCheckedAt(data.openIncidentAcknowledgedAt);
  const maxResponseTimeMs = parseResponseTime(data.maxResponseTimeMs);
  const headerNames = parseNames(data.headerNames);
  const lastReachable = parseFlag(data.lastReachable);
  const lastAssertionsPassed = parseFlag(data.lastAssertionsPassed);
  if (
    port === undefined ||
    expectedStatus === undefined ||
    lastDnsLookupMs === undefined ||
    lastConnectMs === undefined ||
    openIncidentAcknowledgedAt === undefined ||
    maxResponseTimeMs === undefined ||
    headerNames === undefined ||
    lastReachable === undefined ||
    lastAssertionsPassed === undefined
  ) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    url: data.url,
    intervalSeconds: data.intervalSeconds,
    status: data.status,
    lastStatusCode,
    lastResponseTime,
    lastCheckedAt,
    enabled: data.enabled,
    createdAt: data.createdAt,
    ownerId: data.ownerId,
    checkType: parseCheckType(data.checkType),
    port,
    expectedStatus,
    expectedBody: typeof data.expectedBody === 'string' && data.expectedBody.trim() ? data.expectedBody : null,
    lastDnsLookupMs,
    lastConnectMs,
    lastFailureKind: parseFailureKind(data.lastFailureKind),
    openIncidentAcknowledgedAt,
    httpMethod: parseHttpMethod(data.httpMethod),
    maxResponseTimeMs,
    jsonField: optionalText(data.jsonField),
    expectedJsonValue: optionalText(data.expectedJsonValue),
    requestBody: optionalText(data.requestBody),
    bearerTokenConfigured: data.bearerTokenConfigured === true,
    headerNames,
    lastReachable,
    lastAssertionsPassed,
  };
}

function parseStatusCode(value: unknown): number | null | undefined {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 100 || value > 599) {
    return undefined;
  }

  return value;
}

function parseResponseTime(value: unknown): number | null | undefined {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return undefined;
  }

  return value;
}

function parseCheckedAt(value: unknown): string | null | undefined {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    return undefined;
  }

  return value;
}

function isInterval(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 86_400;
}

function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

function isInstant(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function parseCheckType(value: unknown): CheckType {
  if (value === 'HTTPS' || value === 'REST' || value === 'API' || value === 'TCP' || value === 'DNS') {
    return value;
  }

  return 'HTTP';
}

function parseHttpMethod(value: unknown): HttpMethod | null {
  if (value === 'GET' || value === 'POST' || value === 'PUT') {
    return value;
  }

  return null;
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function parseFlag(value: unknown): boolean | null | undefined {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'boolean') {
    return undefined;
  }

  return value;
}

function parseNames(value: unknown): string[] | undefined {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    return undefined;
  }

  return value;
}

function parseFailureKind(value: unknown): FailureKind | null {
  if (
    value === 'TIMEOUT' ||
    value === 'SSL' ||
    value === 'INVALID_RESPONSE' ||
    value === 'SERVER_ERROR' ||
    value === 'CONNECTION' ||
    value === 'DNS'
  ) {
    return value;
  }

  return null;
}

function parsePort(value: unknown): number | null | undefined {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 65535) {
    return undefined;
  }

  return value;
}

function isStatus(value: unknown): value is MonitorStatus {
  return typeof value === 'string' && MONITOR_STATUSES.some((status) => status === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
