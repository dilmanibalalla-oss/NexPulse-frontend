import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { formatCheckedAt, formatResponseTime, formatUptime } from '@/features/dashboard/format';
import type { Monitor } from '@/features/dashboard/types';
import { acknowledgeMonitor, loadCheckHistory, loadMonitor, removeMonitor } from '@/features/monitors/api';
import { MonitorSummary } from '@/features/monitors/components/MonitorSummary';
import { ResponseChart } from '@/features/monitors/components/ResponseChart';
import { formatStatusCode } from '@/features/monitors/format';
import {
  HISTORY_PAGE_SIZE,
  incidentsFromChecks,
  nextHistoryPage,
  responsePoints,
  uptimeFromChecks,
  type Incident,
} from '@/features/monitors/historyView';
import { useMonitorNotice } from '@/features/monitors/notice';
import type { CheckResultResponse } from '@/shared/api/types';
import {
  Button,
  Card,
  ErrorMessage,
  LoadingIndicator,
  Screen,
  StatusBadge,
  Text,
} from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type ReadyState = {
  status: 'ready';
  monitor: Monitor;
  checks: CheckResultResponse[];
  page: number;
  totalPages: number;
  totalElements: number;
  refreshing: boolean;
  loadingMore: boolean;
  actionError: string | null;
};

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | ReadyState;

type MonitorDetailScreenProps = {
  monitorId: number;
};

export function MonitorDetailScreen({ monitorId }: MonitorDetailScreenProps) {
  const theme = useAppTheme();
  const notice = useMonitorNotice((state) => state.message);
  const clearNotice = useMonitorNotice((state) => state.clear);
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const load = useCallback(
    (mode: 'replace' | 'refresh') => {
      if (mode === 'refresh') {
        setState((current) =>
          current.status === 'ready'
            ? { ...current, refreshing: true, actionError: null }
            : { status: 'loading' },
        );
      }

      void Promise.all([
        loadMonitor(monitorId),
        loadCheckHistory(monitorId, 0, HISTORY_PAGE_SIZE),
      ]).then(
        ([monitor, history]) => {
          setState({
            status: 'ready',
            monitor,
            checks: history.content,
            page: history.number,
            totalPages: history.totalPages,
            totalElements: history.totalElements,
            refreshing: false,
            loadingMore: false,
            actionError: null,
          });
          setConfirmingDelete(false);
        },
        (error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'This monitor could not be loaded. Try again.';
          setState((current) =>
            current.status === 'ready' && mode === 'refresh'
              ? { ...current, refreshing: false, actionError: message }
              : { status: 'error', message },
          );
        },
      );
    },
    [monitorId],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void Promise.all([
        loadMonitor(monitorId),
        loadCheckHistory(monitorId, 0, HISTORY_PAGE_SIZE),
      ]).then(
        ([monitor, history]) => {
          if (!active) {
            return;
          }

          setState({
            status: 'ready',
            monitor,
            checks: history.content,
            page: history.number,
            totalPages: history.totalPages,
            totalElements: history.totalElements,
            refreshing: false,
            loadingMore: false,
            actionError: null,
          });
        },
        (error: unknown) => {
          if (!active) {
            return;
          }

          const message =
            error instanceof Error ? error.message : 'This monitor could not be loaded. Try again.';
          setState((current) =>
            current.status === 'ready'
              ? { ...current, refreshing: false, actionError: message }
              : { status: 'error', message },
          );
        },
      );

      return () => {
        active = false;
      };
    }, [monitorId]),
  );

  function loadOlder() {
    if (state.status !== 'ready' || state.loadingMore) {
      return;
    }

    const next = nextHistoryPage(state.page, state.totalPages);
    if (next == null) {
      return;
    }

    setState({ ...state, loadingMore: true, actionError: null });
    void loadCheckHistory(monitorId, next, HISTORY_PAGE_SIZE).then(
      (history) => {
        setState((current) => {
          if (current.status !== 'ready') {
            return current;
          }

          const seen = new Set(current.checks.map((check) => check.id));
          return {
            ...current,
            checks: [...current.checks, ...history.content.filter((check) => !seen.has(check.id))],
            page: history.number,
            totalPages: history.totalPages,
            totalElements: history.totalElements,
            loadingMore: false,
          };
        });
      },
      (error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Older results could not be loaded. Try again.';
        setState((current) =>
          current.status === 'ready'
            ? { ...current, loadingMore: false, actionError: message }
            : current,
        );
      },
    );
  }

  function acknowledge() {
    setAcknowledging(true);
    void acknowledgeMonitor(monitorId).then(
      () => {
        setAcknowledging(false);
        load('refresh');
      },
      (error: unknown) => {
        setAcknowledging(false);
        const message =
          error instanceof Error ? error.message : 'The incident could not be acknowledged. Try again.';
        setState((current) =>
          current.status === 'ready' ? { ...current, actionError: message } : current,
        );
      },
    );
  }

  function deleteMonitor() {
    setDeleting(true);
    void removeMonitor(monitorId).then(
      () => {
        useMonitorNotice.getState().setMessage('Monitor deleted.');
        router.replace('/monitors');
      },
      (error: unknown) => {
        setDeleting(false);
        setState((current) =>
          current.status === 'ready'
            ? {
                ...current,
                actionError:
                  error instanceof Error
                    ? error.message
                    : 'The monitor could not be deleted. Try again.',
              }
            : current,
        );
      },
    );
  }

  if (state.status === 'loading') {
    return (
      <Screen centered>
        <LoadingIndicator label="Loading monitor" size="large" centered />
      </Screen>
    );
  }

  if (state.status === 'error') {
    return (
      <Screen centered onRefresh={() => load('replace')} refreshing={false}>
        <ErrorMessage
          message={state.message}
          title="Monitor unavailable"
          onRetry={() => load('replace')}
        />
      </Screen>
    );
  }

  const hasOlder = nextHistoryPage(state.page, state.totalPages) != null;
  const uptime = uptimeFromChecks(state.checks);
  const incidents = incidentsFromChecks(state.checks, hasOlder);
  const points = responsePoints(state.checks);

  return (
    <Screen onRefresh={() => load('refresh')} refreshing={state.refreshing}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <Button label="Monitors" variant="ghost" onPress={() => router.push('/monitors')} />
        <Button
          label="Edit"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: '/monitors/[id]/edit', params: { id: String(monitorId) } })
          }
        />
      </View>
      {notice ? (
        <Card accent="blue">
          <View style={{ gap: theme.spacing.md }}>
            <Text accessibilityRole="alert">{notice}</Text>
            <Button label="Dismiss" variant="ghost" onPress={clearNotice} />
          </View>
        </Card>
      ) : null}
      {state.actionError ? <ErrorMessage message={state.actionError} /> : null}
      <MonitorSummary monitor={state.monitor} />
      {state.monitor.status === 'DOWN' && state.monitor.openIncidentAcknowledgedAt == null ? (
        <Button
          label="Acknowledge incident"
          loading={acknowledging}
          onPress={acknowledge}
        />
      ) : null}
      {state.monitor.status === 'DOWN' && state.monitor.openIncidentAcknowledgedAt != null ? (
        <Text variant="caption">
          Incident acknowledged {formatCheckedAt(state.monitor.openIncidentAcknowledgedAt)}
        </Text>
      ) : null}
      <Card accent="purple">
        <View
          accessibilityRole="text"
          accessibilityLabel={`Uptime in loaded results, ${formatUptime(uptime)}`}
          style={{ gap: theme.spacing.sm }}
        >
          <Text variant="label">Uptime</Text>
          <Text variant="title" style={{ fontVariant: ['tabular-nums'] }}>
            {formatUptime(uptime)}
          </Text>
          <Text variant="caption">
            {state.totalElements === 0
              ? 'No checks have been stored yet.'
              : hasOlder
                ? `Based on the ${state.checks.length} most recent stored checks.`
                : `Based on all ${state.checks.length} stored checks.`}
          </Text>
        </View>
      </Card>
      <ResponseChart points={points} />
      <IncidentHistory incidents={incidents} />
      <CheckHistory
        checks={state.checks}
        loaded={state.checks.length}
        total={state.totalElements}
        hasOlder={hasOlder}
        loadingMore={state.loadingMore}
        onLoadOlder={loadOlder}
      />
      {confirmingDelete ? (
        <Card>
          <View style={{ gap: theme.spacing.md }}>
            <Text variant="heading">Delete {state.monitor.name}?</Text>
            <Text variant="muted">Its saved checks will be removed.</Text>
            <Button
              label="Delete monitor"
              variant="danger"
              loading={deleting}
              onPress={deleteMonitor}
            />
            <Button
              label="Cancel"
              variant="secondary"
              disabled={deleting}
              onPress={() => setConfirmingDelete(false)}
            />
          </View>
        </Card>
      ) : (
        <Button label="Delete" variant="danger" onPress={() => setConfirmingDelete(true)} />
      )}
    </Screen>
  );
}

function IncidentHistory({ incidents }: { incidents: Incident[] }) {
  const theme = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text accessibilityRole="header" variant="heading">
        Incident history
      </Text>
      {incidents.length === 0 ? (
        <Card>
          <Text variant="muted">No incidents in the loaded results.</Text>
        </Card>
      ) : (
        incidents.map((incident) => (
          <Card key={incident.id}>
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="heading">
                {incident.recoveredAt == null ? 'Ongoing incident' : 'Recovered incident'}
              </Text>
              <Text variant="caption">Started {formatCheckedAt(incident.startedAt)}</Text>
              <Text variant="caption">
                {incident.recoveredAt
                  ? `Recovered ${formatCheckedAt(incident.recoveredAt)}`
                  : 'Still down in the newest loaded check.'}
              </Text>
              <Text variant="caption">
                {incident.checkCount === 1
                  ? '1 failed check'
                  : `${incident.checkCount} failed checks`}
              </Text>
              {incident.errorMessage ? <Text variant="muted">{incident.errorMessage}</Text> : null}
              {incident.mayStartEarlier ? (
                <Text variant="caption">Older checks may extend this incident.</Text>
              ) : null}
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

function CheckHistory({
  checks,
  loaded,
  total,
  hasOlder,
  loadingMore,
  onLoadOlder,
}: {
  checks: CheckResultResponse[];
  loaded: number;
  total: number;
  hasOlder: boolean;
  loadingMore: boolean;
  onLoadOlder: () => void;
}) {
  const theme = useAppTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text accessibilityRole="header" variant="heading">
        Historical results
      </Text>
      <Text variant="caption">
        {total === 0 ? 'No stored checks' : `Showing ${loaded} of ${total}`}
      </Text>
      {checks.length === 0 ? (
        <Card>
          <Text variant="muted">No monitoring results yet.</Text>
        </Card>
      ) : (
        checks.map((check) => (
          <Card key={check.id}>
            <View style={{ gap: theme.spacing.sm }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: theme.spacing.md,
                }}
              >
                <Text variant="heading">{formatCheckedAt(check.checkedAt)}</Text>
                <StatusBadge status={check.successful ? 'UP' : 'DOWN'} />
              </View>
              <Text variant="caption">HTTP {formatStatusCode(check.statusCode)}</Text>
              <Text variant="caption">
                Response time {formatResponseTime(check.responseTimeMs)}
              </Text>
              {check.reachable == null ? null : (
                <Text variant="caption">{check.reachable ? 'Endpoint reachable' : 'Endpoint unreachable'}</Text>
              )}
              {check.assertionsPassed == null ? null : (
                <Text variant="caption">
                  {check.assertionsPassed ? 'Response matches' : 'Response does not match'}
                </Text>
              )}
              {check.errorMessage ? <Text variant="muted">{check.errorMessage}</Text> : null}
            </View>
          </Card>
        ))
      )}
      {hasOlder ? (
        <Button label="Load older results" loading={loadingMore} onPress={onLoadOlder} />
      ) : null}
    </View>
  );
}
