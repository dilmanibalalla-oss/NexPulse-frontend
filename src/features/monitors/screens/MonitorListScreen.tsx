import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import type { Monitor } from '@/features/dashboard/types';
import { loadMonitors, removeMonitor } from '@/features/monitors/api';
import { MonitorSummary } from '@/features/monitors/components/MonitorSummary';
import { MonitorFormScreen } from '@/features/monitors/screens/MonitorFormScreen';
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  function deleteMonitor(id: number) {
    setDeleting(true);
    setActionError(null);
    void removeMonitor(id).then(
      () => {
        setDeleting(false);
        setPendingDeleteId(null);
        useMonitorNotice.getState().setMessage('Monitor deleted.');
        void loadMonitors().then(applyMonitors, applyError);
      },
      (error: unknown) => {
        setDeleting(false);
        setActionError(
          error instanceof Error ? error.message : 'The monitor could not be deleted. Try again.',
        );
      },
    );
  }

  if (editingId != null) {
    return (
      <MonitorFormScreen
        monitorId={editingId}
        onFinished={() => {
          setEditingId(null);
          void loadMonitors().then(applyMonitors, applyError);
        }}
      />
    );
  }

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
      <Button label="Add monitor" onPress={() => router.push('/monitors/new')} />
      {notice ? <Notice message={notice} onDismiss={clearNotice} /> : null}
      {state.refreshError ? <ErrorMessage message={state.refreshError} onRetry={refresh} /> : null}
      {actionError ? <ErrorMessage message={actionError} /> : null}
      {state.monitors.length === 0 ? (
        <Card>
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="heading">No monitors yet</Text>
            <Text variant="muted">Add a website to start collecting check results.</Text>
          </View>
        </Card>
      ) : (
        state.monitors.map((monitor) => (
          <View key={monitor.id} style={{ gap: theme.spacing.sm }}>
            <MonitorSummary monitor={monitor} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
              <Button label="Edit" variant="secondary" onPress={() => setEditingId(monitor.id)} />
              <Button
                label="Delete"
                variant="danger"
                onPress={() => {
                  setActionError(null);
                  setPendingDeleteId(monitor.id);
                }}
              />
            </View>
            {pendingDeleteId === monitor.id ? (
              <Card>
                <View style={{ gap: theme.spacing.md }}>
                  <Text variant="heading">Delete {monitor.name}?</Text>
                  <Text variant="muted">Its saved checks will be removed.</Text>
                  <Button
                    label="Delete monitor"
                    variant="danger"
                    loading={deleting}
                    onPress={() => deleteMonitor(monitor.id)}
                  />
                  <Button
                    label="Cancel"
                    variant="secondary"
                    disabled={deleting}
                    onPress={() => setPendingDeleteId(null)}
                  />
                </View>
              </Card>
            ) : null}
          </View>
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
