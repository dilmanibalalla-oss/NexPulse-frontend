import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components';
import { useAppTheme } from '@/shared/theme';

type StatTone = 'accent' | 'up' | 'down' | 'unknown';

type StatCardProps = {
  label: string;
  value: string;
  tone: StatTone;
  accessibilityLabel: string;
};

export function StatCard({ label, value, tone, accessibilityLabel }: StatCardProps) {
  const theme = useAppTheme();
  const toneColor = colorForTone(tone, theme.colors);

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderLeftColor: toneColor,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <Text variant="label" style={{ color: toneColor }}>
        {label}
      </Text>
      <Text variant="title" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

function colorForTone(
  tone: StatTone,
  colors: { accent: string; up: string; down: string; unknown: string },
): string {
  switch (tone) {
    case 'up':
      return colors.up;
    case 'down':
      return colors.down;
    case 'unknown':
      return colors.unknown;
    case 'accent':
      return colors.accent;
  }
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 3,
    width: '100%',
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
});
