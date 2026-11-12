import { ApiError, toApiError } from '../errors';
import type { ApiClient } from '../http';

export type NotificationPreferences = {
  downEnabled: boolean;
  recoveryEnabled: boolean;
};

export type PushPlatformName = 'ANDROID' | 'IOS';

export async function getNotificationPreferences(
  client: ApiClient,
): Promise<NotificationPreferences> {
  try {
    const response = await client.get('/api/notifications/preferences');
    const preferences = parseNotificationPreferences(response.data);
    if (!preferences) {
      throw new ApiError('The server returned unexpected notification settings.', response.status);
    }

    return preferences;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateNotificationPreferences(
  client: ApiClient,
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  try {
    const response = await client.put('/api/notifications/preferences', preferences);
    const saved = parseNotificationPreferences(response.data);
    if (!saved) {
      throw new ApiError('The server returned unexpected notification settings.', response.status);
    }

    return saved;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function registerPushDevice(
  client: ApiClient,
  token: string,
  platform: PushPlatformName,
): Promise<void> {
  try {
    await client.put('/api/notifications/devices', { token, platform });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function unregisterPushDevice(client: ApiClient, token: string): Promise<void> {
  try {
    await client.delete('/api/notifications/devices', { params: { token } });
  } catch (error) {
    throw toApiError(error);
  }
}

export function parseNotificationPreferences(data: unknown): NotificationPreferences | null {
  if (!isRecord(data)) {
    return null;
  }

  if (typeof data.downEnabled !== 'boolean' || typeof data.recoveryEnabled !== 'boolean') {
    return null;
  }

  return {
    downEnabled: data.downEnabled,
    recoveryEnabled: data.recoveryEnabled,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
