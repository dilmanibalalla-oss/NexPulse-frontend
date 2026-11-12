import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { fetchMonitors } from '@/features/dashboard/api';
import { ResultRow } from '@/features/dashboard/components/ResultRow';
import { StatGrid } from '@/features/dashboard/components/StatGrid';
import { formatResponseTime } from '@/features/dashboard/format';
import { summarizeMonitors, type DashboardSummary } from '@/features/dashboard/summary';
import type { Monitor } from '@/features/dashboard/types';
import { Card, ErrorMessage, LoadingIndicator, Screen, Text } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type ReadyState = {
  status: 'ready';
  monitors: Monitor[];
  refreshing: boolean;
  refreshError: string | null;
};

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | ReadyState;

export function DashboardScreen() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  function applyMonitors(monitors: Monitor[]) {
    setState({ status: 'ready', monitors, refreshing: false, refreshError: null });
  }

  function applyError(error: unknown) {
    const message =
      error instanceof Error ? error.message : 'The dashboard could not be loaded. Try again.';
    setState((current) => {
      if (current.status === 'ready') {
        return { ...current, refreshing: false, refreshError: message };
      }

      return { status: 'error', message };
    });
  }

  function reload() {
    setState({ status: 'loading' });
    void fetchMonitors().then(applyMonitors, applyError);
  }

  function refresh() {
    setState((current) =>
      current.status === 'ready' ? { ...current, refreshing: true, refreshError: null } : current,
    );
    void fetchMonitors().then(applyMonitors, applyError);
  }

  useEffect(() => {
    let active = true;

    void fetchMonitors().then(
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
  }, []);

  if (state.status === 'loading') {
    return (
      <Screen centered>
        <LoadingIndicator label="Loading dashboard" size="large" centered />
      </Screen>
    );
  }

  if (state.status === 'error') {
    return (
      <Screen centered onRefresh={reload} refreshing={false}>
        <ErrorMessage message={state.message} title="Dashboard unavailable" onRetry={reload} />
      </Screen>
    );
  }

  const summary = summarizeMonitors(state.monitors);

  return (
    <Screen onRefresh={refresh} refreshing={state.refreshing}>
      <DashboardHeader />
      {state.refreshError ? <ErrorMessage message={state.refreshError} onRetry={refresh} /> : null}
      <StatGrid summary={summary} />
      <AverageResponse summary={summary} />
      {summary.total === 0 ? <EmptyWebsites /> : <RecentResults summary={summary} />}
    </Screen>
  );
}

function DashboardHeader() {
  const theme = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="label">NexPulse</Text>
      <Text accessibilityRole="header" variant="display">
        Dashboard
      </Text>
      <Text variant="muted">Availability and response time for the websites you monitor.</Text>
    </View>
  );
}

function AverageResponse({ summary }: { summary: DashboardSummary }) {
  const theme = useAppTheme();
  const value = formatResponseTime(summary.averageResponseTimeMs);
  const detail =
    summary.averageResponseTimeMs == null
      ? 'No response times have been recorded yet.'
      : 'Mean of the latest response time for each website.';

  return (
    <Card accent="blue">
      <View
        accessibilityRole="text"
        accessibilityLabel={`Average response time, ${value}`}
        style={{ gap: theme.spacing.sm }}
      >
        <Text variant="label">Average response time</Text>
        <Text variant="title" style={{ fontVariant: ['tabular-nums'] }}>
          {value}
        </Text>
        <Text variant="caption">{detail}</Text>
      </View>
    </Card>
  );
}

function EmptyWebsites() {
  const theme = useAppTheme();

  return (
    <Card>
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="heading">No websites yet</Text>
        <Text variant="muted">
          When you add a website, its status and response time will appear here.
        </Text>
      </View>
    </Card>
  );
}

function RecentResults({ summary }: { summary: DashboardSummary }) {
  const theme = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text accessibilityRole="header" variant="heading">
        Recent results
      </Text>
      {summary.recent.length === 0 ? (
        <Card>
          <Text variant="muted">No monitoring results yet.</Text>
        </Card>
      ) : (
        summary.recent.map((monitor) => <ResultRow key={monitor.id} monitor={monitor} />)
      )}
    </View>
  );
}
