export type AuthUser = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

export function parseRegisteredUser(data: unknown): AuthUser | null {
  if (!isRecord(data)) {
    return null;
  }

  if (typeof data.id !== 'number' || !Number.isInteger(data.id) || data.id < 1) {
    return null;
  }

  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    return null;
  }

  if (typeof data.email !== 'string' || data.email.trim().length === 0) {
    return null;
  }

  if (!isInstant(data.createdAt)) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    createdAt: data.createdAt,
  };
}

export function parseAuthTokenResponse(data: unknown): AuthSession | null {
  if (!isRecord(data) || typeof data.token !== 'string') {
    return null;
  }

  const token = data.token.trim();
  if (!token || /\s/.test(token)) {
    return null;
  }

  if (!isInstant(data.expiresAt)) {
    return null;
  }

  const user = parseRegisteredUser(data.user);
  if (!user) {
    return null;
  }

  return {
    token,
    expiresAt: data.expiresAt.trim(),
    user,
  };
}

function isInstant(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
