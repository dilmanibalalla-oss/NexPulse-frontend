import { apiClient } from '@/shared/api/client';

import { dashboardErrorMessage } from './errors';
import { parseMonitorList } from './parse';
import type { Monitor } from './types';

export async function fetchMonitors(): Promise<Monitor[]> {
  try {
    const response = await apiClient.get('/api/monitors');
    const monitors = parseMonitorList(response.data);
    if (!monitors) {
      throw new Error('Unexpected monitor list.');
    }

    return monitors;
  } catch (error) {
    throw new Error(dashboardErrorMessage(error));
  }
}
