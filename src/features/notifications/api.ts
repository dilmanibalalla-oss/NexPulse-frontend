import { apiClient } from '@/shared/api/client';
import { toApiError } from '@/shared/api/errors';
import { bindClient } from '@/shared/api/http';
import {
  getNotificationPreferences,
  registerPushDevice,
  unregisterPushDevice,
  updateNotificationPreferences,
  type NotificationPreferences,
  type PushPlatformName,
} from '@/shared/api/services/notifications';

const http = () => bindClient(apiClient);

export type { NotificationPreferences, PushPlatformName };

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    return await getNotificationPreferences(http());
  } catch (error) {
    throw toApiError(error);
  }
}

export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  try {
    return await updateNotificationPreferences(http(), preferences);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function savePushDevice(token: string, platform: PushPlatformName): Promise<void> {
  try {
    await registerPushDevice(http(), token, platform);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function removePushDevice(token: string): Promise<void> {
  try {
    await unregisterPushDevice(http(), token);
  } catch (error) {
    throw toApiError(error);
  }
}
