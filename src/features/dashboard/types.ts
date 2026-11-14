export type MonitorStatus = 'UP' | 'DOWN' | 'UNKNOWN';

export type CheckType = 'HTTP' | 'HTTPS' | 'REST' | 'API' | 'TCP' | 'DNS';

export type HttpMethod = 'GET' | 'POST' | 'PUT';

export type FailureKind =
  | 'TIMEOUT'
  | 'SSL'
  | 'INVALID_RESPONSE'
  | 'SERVER_ERROR'
  | 'CONNECTION'
  | 'DNS';

export type Monitor = {
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
  checkType: CheckType;
  port: number | null;
  expectedStatus: number | null;
  expectedBody: string | null;
  lastDnsLookupMs: number | null;
  lastConnectMs: number | null;
  lastFailureKind: FailureKind | null;
  openIncidentAcknowledgedAt: string | null;
  httpMethod: HttpMethod | null;
  maxResponseTimeMs: number | null;
  jsonField: string | null;
  expectedJsonValue: string | null;
  requestBody: string | null;
  bearerTokenConfigured: boolean;
  headerNames: string[];
  lastReachable: boolean | null;
  lastAssertionsPassed: boolean | null;
};
