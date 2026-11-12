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
        <Text variant="caption">HTTP {formatStatusCode(monitor.lastStatusCode)}</Text>
        <Text variant="caption">Response time {formatResponseTime(monitor.lastResponseTime)}</Text>
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
