import { parseMonitorList } from '@/features/dashboard/parse';
import type { CheckType, Monitor } from '@/features/dashboard/types';
import { normalizeMonitorUrl } from '@/features/monitors/validation';

import { ApiError, toApiError } from '../errors';
import type { ApiClient } from '../http';

export type MonitorWrite = {
  name: string;
  url: string;
  intervalSeconds: number;
  enabled: boolean;
  checkType: CheckType;
  port: number | null;
  expectedStatus: number | null;
  expectedBody: string | null;
};

export async function listMonitors(client: ApiClient): Promise<Monitor[]> {
  return readMonitors(client, '/api/monitors');
}

export async function getMonitor(client: ApiClient, id: number): Promise<Monitor> {
  try {
    const response = await client.get(`/api/monitors/${id}`);
    const monitors = parseMonitorList([response.data]);
    const monitor = monitors?.[0];
    if (!monitor) {
      throw new ApiError('The server returned an unexpected monitor.', response.status);
    }

    return monitor;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createMonitor(client: ApiClient, input: MonitorWrite): Promise<Monitor> {
  try {
    const response = await client.post('/api/monitors', monitorBody(input));
    const monitors = parseMonitorList([response.data]);
    const monitor = monitors?.[0];
    if (!monitor) {
      throw new ApiError('The server returned an unexpected monitor.', response.status);
    }

    return monitor;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateMonitor(
  client: ApiClient,
  id: number,
  input: MonitorWrite,
): Promise<Monitor> {
  try {
    const response = await client.put(`/api/monitors/${id}`, monitorBody(input));
    const monitors = parseMonitorList([response.data]);
    const monitor = monitors?.[0];
    if (!monitor) {
      throw new ApiError('The server returned an unexpected monitor.', response.status);
    }

    return monitor;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function acknowledgeIncident(client: ApiClient, id: number): Promise<void> {
  try {
    await client.post(`/api/monitors/${id}/incidents/acknowledge`);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteMonitor(client: ApiClient, id: number): Promise<void> {
  try {
    await client.delete(`/api/monitors/${id}`);
  } catch (error) {
    throw toApiError(error);
  }
}

async function readMonitors(client: ApiClient, url: string): Promise<Monitor[]> {
  try {
    const response = await client.get(url);
    const monitors = parseMonitorList(response.data);
    if (!monitors) {
      throw new ApiError('The server returned an unexpected monitor list.', response.status);
    }

    return monitors;
  } catch (error) {
    throw toApiError(error);
  }
}

function monitorBody(input: MonitorWrite): MonitorWrite {
  const checkType = input.checkType;
  return {
    name: input.name.trim(),
    url: normalizeMonitorUrl(checkType, input.url),
    intervalSeconds: input.intervalSeconds,
    enabled: input.enabled,
    checkType,
    port: checkType === 'TCP' ? input.port : null,
    expectedStatus: checkType === 'REST' ? input.expectedStatus : null,
    expectedBody:
      checkType === 'REST' && input.expectedBody?.trim() ? input.expectedBody.trim() : null,
  };
}
