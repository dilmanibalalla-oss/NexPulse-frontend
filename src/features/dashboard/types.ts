export type MonitorStatus = 'UP' | 'DOWN' | 'UNKNOWN';

export type Monitor = {
  id: number;
  name: string;
  url: string;
  status: MonitorStatus;
  lastStatusCode: number | null;
  lastResponseTime: number | null;
  lastCheckedAt: string | null;
  enabled: boolean;
};
