export function formatInterval(seconds: number): string {
  if (!Number.isInteger(seconds) || seconds < 1) {
    return '—';
  }

  if (seconds % 86_400 === 0) {
    const days = seconds / 86_400;
    return days === 1 ? '1 day' : `${days} days`;
  }

  if (seconds % 3_600 === 0) {
    const hours = seconds / 3_600;
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }

  return seconds === 1 ? '1 second' : `${seconds} seconds`;
}

export function formatStatusCode(code: number | null): string {
  return code == null ? '—' : String(code);
}
