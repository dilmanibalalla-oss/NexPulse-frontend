import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  removePushDevice,
  savePushDevice,
  type PushPlatformName,
} from '@/features/notifications/api';
import { clearAlertCursor } from '@/features/notifications/cursor';
import type { PendingAlert } from '@/features/notifications/observeMonitors';

export const ALERT_CHANNEL_ID = 'monitor-alerts';

type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

let currentToken: string | null = null;

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // This runtime has no notification handler.
}

export async function readNotificationPermission(): Promise<PermissionState> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }

  try {
    const permission = await Notifications.getPermissionsAsync();
    if (permission.status === 'granted' || permission.status === 'denied') {
      return permission.status;
    }
    return 'undetermined';
  } catch {
    return 'unsupported';
  }
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }

  try {
    const permission = await Notifications.requestPermissionsAsync();
    return permission.status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

export async function presentMonitorAlert(alert: PendingAlert): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: alert.kind === 'down' ? 'Website down' : 'Website recovered',
      body: alert.kind === 'down' ? `${alert.name} is down` : `${alert.name} is back up`,
      data: { monitorId: alert.monitorId, kind: alert.kind },
      sound: 'default',
    },
    trigger: Platform.OS === 'android' ? { channelId: ALERT_CHANNEL_ID } : null,
  });
}

export async function registerForPushAlerts(): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return pushSetupNote();
  }

  const permission = await readNotificationPermission();
  if (permission !== 'granted') {
    return null;
  }

  const projectId = readProjectId();
  if (!projectId) {
    return 'Remote alerts need an Expo project id. Alerts still appear while NexPulse is open.';
  }

  try {
    await ensureAndroidChannel();
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    if (!token || currentToken === token) {
      currentToken = token || currentToken;
      return null;
    }

    const platform: PushPlatformName = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
    await savePushDevice(token, platform);
    currentToken = token;
    return null;
  } catch {
    return 'This device could not register for remote alerts. Alerts still appear while NexPulse is open.';
  }
}

export function pushSetupNote(): string | null {
  if (Platform.OS === 'web') {
    return 'Down and recovery alerts are available in the iOS and Android apps.';
  }
  if (!Device.isDevice) {
    return 'Remote alerts need a physical device. Alerts still appear while NexPulse is open.';
  }
  if (!readProjectId()) {
    return 'Remote alerts need an Expo project id. Alerts still appear while NexPulse is open.';
  }
  return null;
}

export async function unregisterThisDevice(): Promise<void> {
  const token = currentToken;
  currentToken = null;
  await clearAlertCursor();
  if (!token) {
    return;
  }

  try {
    await removePushDevice(token);
  } catch {
    // Sign-out continues when the server cannot be reached.
  }
}

export function readNotificationMonitorId(data: unknown): number | null {
  if (typeof data !== 'object' || data === null || !('monitorId' in data)) {
    return null;
  }

  const value = data.monitorId;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string' && /^[1-9]\d*$/.test(value)) {
    return Number(value);
  }
  return null;
}

function readProjectId(): string | null {
  const fromEas = Constants.easConfig?.projectId;
  const extra = Constants.expoConfig?.extra;
  const fromExtra =
    extra && typeof extra === 'object' && 'eas' in extra
      ? extra.eas && typeof extra.eas === 'object' && 'projectId' in extra.eas
        ? extra.eas.projectId
        : undefined
      : undefined;
  const fromEnv = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  for (const value of [fromEas, fromExtra, fromEnv]) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
    name: 'Monitor alerts',
    importance: Notifications.AndroidImportance.HIGH,
  });
}
