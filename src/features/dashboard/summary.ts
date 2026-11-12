import type { Monitor } from './types';

export const RECENT_RESULT_LIMIT = 10;

export type DashboardSummary = {
  total: number;
  up: number;
  down: number;
  unknown: number;
  averageResponseTimeMs: number | null;
  uptimePercent: number | null;
  recent: Monitor[];
};

export function summarizeMonitors(monitors: Monitor[]): DashboardSummary {
  const times = monitors.flatMap((monitor) =>
    monitor.lastResponseTime == null ? [] : [monitor.lastResponseTime],
  );
  const averageResponseTimeMs =
    times.length === 0
      ? null
      : Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);

  const recent = monitors
    .filter((monitor) => monitor.lastCheckedAt != null)
    .sort((left, right) => {
      const byTime = Date.parse(right.lastCheckedAt ?? '') - Date.parse(left.lastCheckedAt ?? '');
      if (byTime !== 0) {
        return byTime;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, RECENT_RESULT_LIMIT);

  const up = monitors.filter((monitor) => monitor.status === 'UP').length;
  const down = monitors.filter((monitor) => monitor.status === 'DOWN').length;
  const observed = up + down;

  return {
    total: monitors.length,
    up,
    down,
    unknown: monitors.filter((monitor) => monitor.status === 'UNKNOWN').length,
    averageResponseTimeMs,
    uptimePercent: observed === 0 ? null : Math.round((up / observed) * 100),
    recent,
  };
}
