import { StyleSheet, View } from 'react-native';

import { env } from '@/shared/config/env';
import { Card, Screen, StatusBadge, Text } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

export function HomeScreen() {
  const theme = useAppTheme();

  return (
    <Screen>
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="label">NexPulse</Text>
        <Text accessibilityRole="header" variant="display">
          Dashboard
        </Text>
        <Text variant="muted">Availability and response time for the services you run.</Text>
      </View>

      <Card>
        <Text variant="label">Status</Text>
        <View style={[styles.badges, { gap: theme.spacing.sm }]}>
          <StatusBadge status="UP" />
          <StatusBadge status="DOWN" />
          <StatusBadge status="UNKNOWN" />
        </View>
      </Card>

      <Card accent="purple">
        <Text variant="label">API origin</Text>
        <Text variant="body">{env.apiUrl}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
