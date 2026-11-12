import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import type { Monitor } from '@/features/dashboard/types';
import { loadMonitors } from '@/features/monitors/api';
import { MonitorSummary } from '@/features/monitors/components/MonitorSummary';
import { useMonitorNotice } from '@/features/monitors/notice';
import { Button, Card, ErrorMessage, LoadingIndicator, Screen, Text } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type ReadyState = {
  status: 'ready';
  monitors: Monitor[];
  refreshing: boolean;
  refreshError: string | null;
};

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | ReadyState;

export function MonitorListScreen() {
  const theme = useAppTheme();
  const notice = useMonitorNotice((state) => state.message);
  const clearNotice = useMonitorNotice((state) => state.clear);
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  function applyMonitors(monitors: Monitor[]) {
    setState({ status: 'ready', monitors, refreshing: false, refreshError: null });
  }

  function applyError(error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Monitors could not be loaded. Try again.';
    setState((current) =>
      current.status === 'ready'
        ? { ...current, refreshing: false, refreshError: message }
        : { status: 'error', message },
    );
  }

  function refresh() {
    setState((current) =>
      current.status === 'ready'
        ? { ...current, refreshing: true, refreshError: null }
        : { status: 'loading' },
    );
    clearNotice();
    void loadMonitors().then(applyMonitors, applyError);
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void loadMonitors().then(
        (monitors) => {
          if (active) {
            applyMonitors(monitors);
          }
        },
        (error: unknown) => {
          if (active) {
            applyError(error);
          }
        },
      );

      return () => {
        active = false;
      };
    }, []),
  );

  if (state.status === 'loading') {
    return (
      <Screen centered>
        <LoadingIndicator label="Loading monitors" size="large" centered />
      </Screen>
    );
  }

  if (state.status === 'error') {
    return (
      <Screen centered onRefresh={refresh} refreshing={false}>
        {notice ? <Notice message={notice} onDismiss={clearNotice} /> : null}
        <ErrorMessage message={state.message} title="Monitors unavailable" onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen onRefresh={refresh} refreshing={state.refreshing}>
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="label">NexPulse</Text>
        <Text accessibilityRole="header" variant="display">
          Monitors
        </Text>
        <Text variant="muted">Websites checked on the interval you set.</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <Button label="Dashboard" variant="ghost" onPress={() => router.push('/')} />
        <Button label="Add monitor" onPress={() => router.push('/monitors/new')} />
      </View>
      {notice ? <Notice message={notice} onDismiss={clearNotice} /> : null}
      {state.refreshError ? <ErrorMessage message={state.refreshError} onRetry={refresh} /> : null}
      {state.monitors.length === 0 ? (
        <Card>
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="heading">No monitors yet</Text>
            <Text variant="muted">Add a website to start collecting check results.</Text>
          </View>
        </Card>
      ) : (
        state.monitors.map((monitor) => (
          <MonitorSummary
            key={monitor.id}
            monitor={monitor}
            onPress={() =>
              router.push({ pathname: '/monitors/[id]/index', params: { id: String(monitor.id) } })
            }
          />
        ))
      )}
    </Screen>
  );
}

function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useAppTheme();

  return (
    <Card accent="blue">
      <View style={{ gap: theme.spacing.md }}>
        <Text accessibilityRole="alert">{message}</Text>
        <Button label="Dismiss" variant="ghost" onPress={onDismiss} />
      </View>
    </Card>
  );
}
