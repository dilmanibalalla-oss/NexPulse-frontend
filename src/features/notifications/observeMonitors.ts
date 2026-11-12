import type { Monitor, MonitorStatus } from '@/features/dashboard/types';

export type AlertCursor = Record<string, MonitorStatus>;

export type PendingAlert = {
  monitorId: number;
  kind: 'down' | 'recovery';
  name: string;
};

export function observeMonitors(
  cursor: AlertCursor | null,
  monitors: readonly Monitor[],
  preferences: { downEnabled: boolean; recoveryEnabled: boolean },
): { cursor: AlertCursor; alerts: PendingAlert[] } {
  const next: AlertCursor = {};
  const alerts: PendingAlert[] = [];

  for (const monitor of monitors) {
    const key = String(monitor.id);
    next[key] = monitor.status;
    if (cursor == null || cursor[key] == null) {
      continue;
    }

    const previous = cursor[key];
    if (previous !== 'DOWN' && monitor.status === 'DOWN' && preferences.downEnabled) {
      alerts.push({ monitorId: monitor.id, kind: 'down', name: monitor.name });
    }
    if (previous === 'DOWN' && monitor.status === 'UP' && preferences.recoveryEnabled) {
      alerts.push({ monitorId: monitor.id, kind: 'recovery', name: monitor.name });
    }
  }

  return { cursor: next, alerts };
}

export function parseAlertCursor(data: unknown): AlertCursor | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return null;
  }

  const cursor: AlertCursor = {};
  for (const [key, value] of Object.entries(data)) {
    if (!/^[1-9]\d*$/.test(key) || !isStatus(value)) {
      return null;
    }
    cursor[key] = value;
  }

  return cursor;
}

function isStatus(value: unknown): value is MonitorStatus {
  return value === 'UP' || value === 'DOWN' || value === 'UNKNOWN';
}
