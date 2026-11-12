import type { Monitor, MonitorStatus } from './types';

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

  if (!isStatus(data.status)) {
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

  return {
    id: data.id,
    name: data.name,
    url: data.url,
    status: data.status,
    lastStatusCode,
    lastResponseTime,
    lastCheckedAt,
    enabled: data.enabled,
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

function isStatus(value: unknown): value is MonitorStatus {
  return typeof value === 'string' && MONITOR_STATUSES.some((status) => status === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
