export const MONITOR_NAME_MAX = 120;
export const MONITOR_URL_MAX = 2048;
export const MONITOR_INTERVAL_MIN = 1;
export const MONITOR_INTERVAL_MAX = 86_400;

export type MonitorField = 'name' | 'url' | 'intervalSeconds';
export type MonitorFieldErrors = Partial<Record<MonitorField, string>>;

export type MonitorFormValues = {
  name: string;
  url: string;
  intervalSeconds: string;
  enabled: boolean;
};

export function validateMonitor(values: MonitorFormValues): MonitorFieldErrors {
  const errors: MonitorFieldErrors = {};
  const name = values.name.trim();
  const url = values.url.trim();

  if (!name) {
    errors.name = 'Enter a name.';
  } else if (name.length > MONITOR_NAME_MAX) {
    errors.name = `Name must be ${MONITOR_NAME_MAX} characters or fewer.`;
  }

  if (!url) {
    errors.url = 'Enter a URL.';
  } else if (url.length > MONITOR_URL_MAX) {
    errors.url = `URL must be ${MONITOR_URL_MAX} characters or fewer.`;
  } else if (!isHttpUrl(url)) {
    errors.url = 'Enter an http or https URL.';
  }

  if (!isInterval(values.intervalSeconds)) {
    errors.intervalSeconds = `Enter a whole number of seconds from ${MONITOR_INTERVAL_MIN} to ${MONITOR_INTERVAL_MAX}.`;
  }

  return errors;
}

export function hasMonitorErrors(errors: MonitorFieldErrors): boolean {
  return Object.values(errors).some((message) => Boolean(message));
}

function isInterval(value: string): boolean {
  if (!/^\d+$/.test(value.trim())) {
    return false;
  }

  const interval = Number(value);
  return interval >= MONITOR_INTERVAL_MIN && interval <= MONITOR_INTERVAL_MAX;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}
