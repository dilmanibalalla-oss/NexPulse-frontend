export function formatResponseTime(milliseconds: number | null): string {
  if (milliseconds == null) {
    return '—';
  }

  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  const seconds = milliseconds / 1000;
  const rounded = seconds >= 10 ? String(Math.round(seconds)) : seconds.toFixed(1);
  return `${rounded} s`;
}

export function formatCheckedAt(value: string, now = Date.now()): string {
  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    return value;
  }

  const elapsed = Math.max(0, now - time);
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(time),
  );
}

export function websiteHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
