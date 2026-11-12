import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Switch, View } from 'react-native';

import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from '@/features/notifications/api';
import {
  pushSetupNote,
  readNotificationPermission,
  registerForPushAlerts,
  requestNotificationPermission,
} from '@/features/notifications/push';
import { Button, Card, ErrorMessage, LoadingIndicator, Screen, Text } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type ReadyState = {
  status: 'ready';
  preferences: NotificationPreferences;
  permission: string;
  note: string | null;
  saving: boolean;
  actionError: string | null;
};

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | ReadyState;

export function NotificationSettingsScreen() {
  const theme = useAppTheme();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const load = useCallback((mode: 'replace' | 'refresh') => {
    if (mode === 'refresh') {
      setState((current) =>
        current.status === 'ready' ? { ...current, saving: true, actionError: null } : current,
      );
    }

    void Promise.all([loadNotificationPreferences(), readNotificationPermission()]).then(
      ([preferences, permission]) => {
        setState({
          status: 'ready',
          preferences,
          permission,
          note: pushSetupNote(),
          saving: false,
          actionError: null,
        });
      },
      (error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Notification settings could not be loaded. Try again.';
        setState((current) =>
          current.status === 'ready' && mode === 'refresh'
            ? { ...current, saving: false, actionError: message }
            : { status: 'error', message },
        );
      },
    );
  }, []);

  useEffect(() => {
    load('replace');
  }, [load]);

  function update(next: NotificationPreferences, previous: NotificationPreferences) {
    setState((current) =>
      current.status === 'ready'
        ? { ...current, preferences: next, saving: true, actionError: null }
        : current,
    );
    void saveNotificationPreferences(next).then(
      (preferences) => {
        setState((current) =>
          current.status === 'ready' ? { ...current, preferences, saving: false } : current,
        );
      },
      (error: unknown) => {
        setState((current) =>
          current.status === 'ready'
            ? {
                ...current,
                preferences: previous,
                saving: false,
                actionError:
                  error instanceof Error
                    ? error.message
                    : 'Notification settings could not be saved. Try again.',
              }
            : current,
        );
      },
    );
  }

  async function allowNotifications() {
    const permission = await requestNotificationPermission();
    const note = permission === 'granted' ? await registerForPushAlerts() : pushSetupNote();
    setState((current) =>
      current.status === 'ready' ? { ...current, permission, note } : current,
    );
  }

  if (state.status === 'loading') {
    return (
      <Screen centered>
        <LoadingIndicator label="Loading notification settings" size="large" centered />
      </Screen>
    );
  }

  if (state.status === 'error') {
    return (
      <Screen centered onRefresh={() => load('replace')} refreshing={false}>
        <ErrorMessage
          message={state.message}
          title="Notification settings unavailable"
          onRetry={() => load('replace')}
        />
      </Screen>
    );
  }

  return (
    <Screen onRefresh={() => load('refresh')} refreshing={state.saving}>
      <View style={{ gap: theme.spacing.md }}>
        <Button label="Dashboard" variant="ghost" onPress={() => router.push('/')} />
        <Text accessibilityRole="header" variant="display">
          Alerts
        </Text>
        <Text variant="muted">
          NexPulse stores these switches on your account. A website sends one alert when its stored
          status changes to down, and one alert when that incident recovers.
        </Text>
      </View>
      {state.actionError ? <ErrorMessage message={state.actionError} /> : null}
      <Card>
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="heading">Permission</Text>
          <Text variant="muted">{permissionLabel(state.permission)}</Text>
          {state.permission === 'granted' ? null : (
            <Button label="Allow notifications" onPress={() => void allowNotifications()} />
          )}
          {state.note ? <Text variant="caption">{state.note}</Text> : null}
        </View>
      </Card>
      <PreferenceSwitch
        label="Website down"
        caption="Alert when a monitored website changes to down."
        value={state.preferences.downEnabled}
        disabled={state.saving}
        onChange={(downEnabled) => update({ ...state.preferences, downEnabled }, state.preferences)}
      />
      <PreferenceSwitch
        label="Website recovered"
        caption="Alert when a down website changes back to up."
        value={state.preferences.recoveryEnabled}
        disabled={state.saving}
        onChange={(recoveryEnabled) =>
          update({ ...state.preferences, recoveryEnabled }, state.preferences)
        }
      />
      <Card accent="blue">
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="heading">While the app is closed</Text>
          <Text variant="muted">
            Closed-app alerts are Expo push messages from the server. The phone does not keep
            checking websites after NexPulse closes. The server sends a push when it records a real
            status change for your account, using the Expo token saved for this device.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

function PreferenceSwitch({
  label,
  caption,
  value,
  disabled,
  onChange,
}: {
  label: string;
  caption: string;
  value: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useAppTheme();

  return (
    <Card>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.sm }}>
          <Text variant="heading">{label}</Text>
          <Text variant="caption">{caption}</Text>
        </View>
        <Switch
          accessibilityLabel={label}
          value={value}
          disabled={disabled}
          onValueChange={onChange}
          trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
          thumbColor={theme.colors.text}
        />
      </View>
    </Card>
  );
}

function permissionLabel(permission: string): string {
  if (permission === 'granted') {
    return 'Notifications are allowed for NexPulse.';
  }
  if (permission === 'unsupported') {
    return 'This device cannot show NexPulse notifications.';
  }
  if (permission === 'denied') {
    return 'Notifications are blocked. Allow them in system settings, then return here.';
  }
  return 'Allow notifications to hear about down and recovered websites.';
}
