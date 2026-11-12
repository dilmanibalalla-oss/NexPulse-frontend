import { apiClient } from '@/shared/api/client';
import { toApiError } from '@/shared/api/errors';
import { bindClient } from '@/shared/api/http';
import { listMonitors } from '@/shared/api/services/monitors';

import type { Monitor } from './types';

export async function fetchMonitors(): Promise<Monitor[]> {
  try {
    return await listMonitors(bindClient(apiClient));
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}
