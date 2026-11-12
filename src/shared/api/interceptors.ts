const CREDENTIAL_PATHS = ['/api/auth/login', '/api/auth/register'] as const;

export function bearerValue(token: string): string {
  return `Bearer ${token}`;
}

export function shouldEndSession(
  status: number | undefined,
  url: string | undefined,
  token: string | null,
): boolean {
  return status === 401 && Boolean(token) && !isCredentialRequest(url);
}

function isCredentialRequest(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  return CREDENTIAL_PATHS.some((path) => url.endsWith(path));
}
