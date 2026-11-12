const DEFAULT_API_URL = 'http://localhost:8080';

export function resolveApiUrl(value: string | undefined): string {
  const candidate = value?.trim();
  if (!candidate) {
    return DEFAULT_API_URL;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL must be an absolute URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_API_URL must use http or https.');
  }

  return candidate.replace(/\/+$/, '');
}

export const env = {
  apiUrl: resolveApiUrl(process.env.EXPO_PUBLIC_API_URL),
} as const;
