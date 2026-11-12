import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { logout } from '@/features/auth/api';
import { fetchMonitors } from '@/features/dashboard/api';
import { ResultRow } from '@/features/dashboard/components/ResultRow';
import { StatGrid } from '@/features/dashboard/components/StatGrid';
import { formatResponseTime, formatUptime } from '@/features/dashboard/format';
import { summarizeMonitors, type DashboardSummary } from '@/features/dashboard/summary';
import type { Monitor } from '@/features/dashboard/types';
import { Button, Card, ErrorMessage, LoadingIndicator, Screen, Text } from '@/shared/components';
import { useAppTheme, useResponsive } from '@/shared/theme';

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
      <DashboardHeader
        onError={(message) => {
          setState((current) =>
            current.status === 'ready' ? { ...current, refreshError: message } : current,
          );
        }}
      />
      {state.refreshError ? <ErrorMessage message={state.refreshError} onRetry={refresh} /> : null}
      <StatGrid summary={summary} />
      <Metrics summary={summary} />
      {summary.total === 0 ? <EmptyWebsites /> : <RecentResults summary={summary} />}
    </Screen>
  );
}

function DashboardHeader({ onError }: { onError: (message: string) => void }) {
  const theme = useAppTheme();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await logout();
    } catch (error) {
      setSigningOut(false);
      onError(
        error instanceof Error ? error.message : 'Could not sign out on this device. Try again.',
      );
    }
  }

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
        }}
      >
        <Text variant="label">NexPulse</Text>
        <Button
          label="Monitors"
          variant="ghost"
          onPress={() => {
            router.push('/monitors/index');
          }}
        />
        <Button
          label="Sign out"
          variant="ghost"
          loading={signingOut}
          onPress={() => {
            void signOut();
          }}
        />
      </View>
      <Text accessibilityRole="header" variant="display">
        Dashboard
      </Text>
      <Text variant="muted">Availability and response time for the websites you monitor.</Text>
    </View>
  );
}

function Metrics({ summary }: { summary: DashboardSummary }) {
  const theme = useAppTheme();
  const responsive = useResponsive();
  const basis = responsive.isTablet ? '48%' : '100%';

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
      <View style={{ flexGrow: 1, flexBasis: basis }}>
        <AverageResponse summary={summary} />
      </View>
      <View style={{ flexGrow: 1, flexBasis: basis }}>
        <Uptime summary={summary} />
      </View>
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

function Uptime({ summary }: { summary: DashboardSummary }) {
  const theme = useAppTheme();
  const value = formatUptime(summary.uptimePercent);
  const detail =
    summary.uptimePercent == null
      ? 'No websites have a known status yet.'
      : 'Share of websites with a known status that are currently up.';

  return (
    <Card accent="purple">
      <View
        accessibilityRole="text"
        accessibilityLabel={`Overall uptime, ${value}`}
        style={{ gap: theme.spacing.sm }}
      >
        <Text variant="label">Overall uptime</Text>
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
        Recent monitoring activity
      </Text>
      {summary.recent.length === 0 ? (
        <Card>
          <Text variant="muted">No monitoring results yet.</Text>
        </Card>
      ) : (
        summary.recent.map((monitor) => (
          <ResultRow
            key={monitor.id}
            monitor={monitor}
            onPress={() =>
              router.push({ pathname: '/monitors/[id]/index', params: { id: String(monitor.id) } })
            }
          />
        ))
      )}
    </View>
  );
}
