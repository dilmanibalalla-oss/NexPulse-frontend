import { apiClient } from '@/shared/api/client';
import { toApiError } from '@/shared/api/errors';
import { bindClient } from '@/shared/api/http';
import { listCheckHistory } from '@/shared/api/services/history';
import {
  acknowledgeIncident,
  createMonitor,
  deleteMonitor,
  getMonitor,
  listMonitors,
  updateMonitor,
  type MonitorWrite,
} from '@/shared/api/services/monitors';
import type { CheckHistoryPage } from '@/shared/api/types';
import type { Monitor } from '@/features/dashboard/types';

const http = () => bindClient(apiClient);

export async function loadMonitors(): Promise<Monitor[]> {
  try {
    return await listMonitors(http());
  } catch (error) {
    throw toApiError(error);
  }
}

export async function loadMonitor(id: number): Promise<Monitor> {
  try {
    return await getMonitor(http(), id);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function saveMonitor(id: number | null, input: MonitorWrite): Promise<Monitor> {
  try {
    return id == null ? await createMonitor(http(), input) : await updateMonitor(http(), id, input);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function acknowledgeMonitor(id: number): Promise<void> {
  try {
    await acknowledgeIncident(http(), id);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function removeMonitor(id: number): Promise<void> {
  try {
    await deleteMonitor(http(), id);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function loadCheckHistory(
  id: number,
  page: number,
  size: number,
): Promise<CheckHistoryPage> {
  try {
    return await listCheckHistory(http(), id, page, size);
  } catch (error) {
    throw toApiError(error);
  }
}
