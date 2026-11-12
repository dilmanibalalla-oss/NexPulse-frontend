import { View } from 'react-native';

import { formatCheckedAt, formatResponseTime, websiteHost } from '@/features/dashboard/format';
import type { Monitor } from '@/features/dashboard/types';
import { Card, StatusBadge, Text } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type ResultRowProps = {
  monitor: Monitor;
  now?: number;
};

export function ResultRow({ monitor, now }: ResultRowProps) {
  const theme = useAppTheme();
  const checked = monitor.lastCheckedAt
    ? formatCheckedAt(monitor.lastCheckedAt, now)
    : 'Not checked';
  const timing = [
    statusCode(monitor.lastStatusCode),
    formatResponseTime(monitor.lastResponseTime),
    checked,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
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
          <Text variant="heading" numberOfLines={1} style={{ flex: 1 }}>
            {monitor.name}
          </Text>
          <StatusBadge status={monitor.status} />
        </View>
        <Text variant="muted" numberOfLines={1}>
          {websiteHost(monitor.url)}
        </Text>
        <Text variant="caption">{timing}</Text>
        {monitor.enabled ? null : <Text variant="caption">Paused</Text>}
      </View>
    </Card>
  );
}

function statusCode(code: number | null): string | null {
  return code == null ? null : String(code);
}
