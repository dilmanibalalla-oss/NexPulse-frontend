import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { loadMonitors } from '@/features/monitors/api';
import { loadNotificationPreferences } from '@/features/notifications/api';
import { readAlertCursor, writeAlertCursor } from '@/features/notifications/cursor';
import { observeMonitors } from '@/features/notifications/observeMonitors';
import {
  presentMonitorAlert,
  readNotificationMonitorId,
  readNotificationPermission,
  registerForPushAlerts,
} from '@/features/notifications/push';

const POLL_INTERVAL_MS = 30_000;

export function AlertWatch() {
  useEffect(() => {
    let active = true;
    let running = false;

    async function tick() {
      if (running) {
        return;
      }
      running = true;
      try {
        const [preferences, monitors, cursor, permission] = await Promise.all([
          loadNotificationPreferences(),
          loadMonitors(),
          readAlertCursor(),
          readNotificationPermission(),
        ]);
        if (!active) {
          return;
        }

        const observed = observeMonitors(cursor, monitors, preferences);
        await writeAlertCursor(observed.cursor);
        if (cursor == null || permission !== 'granted') {
          return;
        }

        for (const alert of observed.alerts) {
          await presentMonitorAlert(alert);
        }
      } catch {
        // The next poll retries with the latest stored monitor status.
      } finally {
        running = false;
      }
    }

    void tick();
    void registerForPushAlerts();

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void tick();
        void registerForPushAlerts();
      }
    });
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') {
        void tick();
      }
    }, POLL_INTERVAL_MS);
    const responses = Notifications.addNotificationResponseReceivedListener((response) => {
      const monitorId = readNotificationMonitorId(response.notification.request.content.data);
      if (monitorId != null) {
        router.push({ pathname: '/monitors/[id]/index', params: { id: String(monitorId) } });
      }
    });

    return () => {
      active = false;
      appState.remove();
      clearInterval(timer);
      responses.remove();
    };
  }, []);

  return null;
}
