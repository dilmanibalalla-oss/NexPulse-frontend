export type UserResponse = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthTokenResponse = {
  token: string;
  expiresAt: string;
  user: UserResponse;
};

export type MonitorStatus = 'UP' | 'DOWN' | 'UNKNOWN';

export type MonitorResponse = {
  id: number;
  name: string;
  url: string;
  intervalSeconds: number;
  status: MonitorStatus;
  lastStatusCode: number | null;
  lastResponseTime: number | null;
  lastCheckedAt: string | null;
  enabled: boolean;
  createdAt: string;
  ownerId: number;
};

export type CheckResultResponse = {
  id: number;
  monitorId: number;
  checkedAt: string;
  successful: boolean;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  reachable?: boolean | null;
  assertionsPassed?: boolean | null;
};

export type CheckHistoryPage = {
  content: CheckResultResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
