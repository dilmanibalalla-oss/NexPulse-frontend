import * as SecureStore from 'expo-secure-store';

import { parseAlertCursor, type AlertCursor } from '@/features/notifications/observeMonitors';

const CURSOR_KEY = 'nexpulse.alert-cursor';

let memory: AlertCursor | null = null;

export async function readAlertCursor(): Promise<AlertCursor | null> {
  try {
    const raw = await SecureStore.getItemAsync(CURSOR_KEY);
    if (!raw) {
      memory = null;
      return null;
    }

    const parsed = parseAlertCursor(JSON.parse(raw) as unknown);
    memory = parsed;
    return parsed;
  } catch {
    return memory;
  }
}

export async function writeAlertCursor(cursor: AlertCursor): Promise<void> {
  memory = cursor;
  try {
    await SecureStore.setItemAsync(CURSOR_KEY, JSON.stringify(cursor));
  } catch {
    // The in-memory cursor still prevents duplicate alerts for this session.
  }
}

export async function clearAlertCursor(): Promise<void> {
  memory = null;
  try {
    await SecureStore.deleteItemAsync(CURSOR_KEY);
  } catch {
    // Sign-out still clears the in-memory cursor.
  }
}
