import { View } from 'react-native';

import { env } from '@/shared/config/env';
import { Card, Screen, StatusDot, Text } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

export function HomeScreen() {
  const theme = useAppTheme();

  return (
    <Screen>
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="label">NexPulse</Text>
        <Text accessibilityRole="header" variant="display">
          Service monitoring
        </Text>
        <Text variant="muted">Availability and response time for the services you run.</Text>
      </View>

      <Card>
        <Text variant="label">Status</Text>
        <View style={{ gap: theme.spacing.md }}>
          <StatusDot color={theme.colors.up} label="Up" />
          <StatusDot color={theme.colors.down} label="Down" />
          <StatusDot color={theme.colors.unknown} label="Waiting" />
        </View>
      </Card>

      <Card>
        <Text variant="label">API origin</Text>
        <Text variant="body">{env.apiUrl}</Text>
      </Card>
    </Screen>
  );
}
