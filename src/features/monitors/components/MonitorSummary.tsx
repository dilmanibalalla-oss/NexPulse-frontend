import { Pressable, View } from 'react-native';

import { formatCheckedAt, formatResponseTime } from '@/features/dashboard/format';
import type { Monitor } from '@/features/dashboard/types';
import { formatInterval, formatStatusCode } from '@/features/monitors/format';
import { Card, StatusBadge, Text } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type MonitorSummaryProps = {
  monitor: Monitor;
  now?: number;
  onPress?: () => void;
};

export function MonitorSummary({ monitor, now, onPress }: MonitorSummaryProps) {
  const theme = useAppTheme();
  const checked = monitor.lastCheckedAt
    ? formatCheckedAt(monitor.lastCheckedAt, now)
    : 'Not checked yet';
  const content = (
    <Card>
      <View style={{ gap: theme.spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
          }}
        >
          <Text variant="heading" numberOfLines={2} style={{ flex: 1 }}>
            {monitor.name}
          </Text>
          <StatusBadge status={monitor.status} />
        </View>
        <Text variant="muted">{monitor.url}</Text>
        <Text variant="caption">
          {monitor.checkType === 'API' && monitor.httpMethod ? `${monitor.httpMethod} ` : ''}
          {monitor.checkType}
          {monitor.port == null ? '' : ` port ${monitor.port}`}
        </Text>
        {monitor.checkType === 'API' ? (
          <Text variant="caption">
            {monitor.lastReachable == null
              ? 'Reachability not checked yet'
              : monitor.lastReachable
                ? 'Endpoint reachable'
                : 'Endpoint unreachable'}
            {monitor.lastAssertionsPassed == null
              ? ''
              : monitor.lastAssertionsPassed
                ? ', response matches'
                : ', response does not match'}
          </Text>
        ) : null}
        <Text variant="caption">HTTP {formatStatusCode(monitor.lastStatusCode)}</Text>
        <Text variant="caption">Response time {formatResponseTime(monitor.lastResponseTime)}</Text>
        <Text variant="caption">DNS lookup {formatResponseTime(monitor.lastDnsLookupMs)}</Text>
        <Text variant="caption">Connection {formatResponseTime(monitor.lastConnectMs)}</Text>
        {monitor.lastFailureKind ? (
          <Text variant="caption">Failure {monitor.lastFailureKind}</Text>
        ) : null}
        <Text variant="caption">Last checked {checked}</Text>
        <Text variant="caption">Interval {formatInterval(monitor.intervalSeconds)}</Text>
        {monitor.enabled ? null : <Text variant="caption">Monitoring is paused</Text>}
      </View>
    </Card>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${monitor.name}, ${monitor.status}`}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
