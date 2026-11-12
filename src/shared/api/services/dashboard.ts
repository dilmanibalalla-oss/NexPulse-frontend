import { summarizeMonitors, type DashboardSummary } from '@/features/dashboard/summary';

import type { ApiClient } from '../http';
import { listMonitors } from './monitors';

export async function loadDashboard(client: ApiClient): Promise<DashboardSummary> {
  const monitors = await listMonitors(client);
  return summarizeMonitors(monitors);
}
