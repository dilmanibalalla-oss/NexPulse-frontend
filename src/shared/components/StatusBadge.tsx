import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components/Text';
import { useAppTheme, type MonitorStatus } from '@/shared/theme';

type StatusBadgeProps = {
  status: MonitorStatus;
  label?: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const theme = useAppTheme();
  const token = theme.status[status];
  const text = label ?? token.label;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={text}
      style={[
        styles.badge,
        {
          backgroundColor: token.background,
          borderRadius: theme.radius.pill,
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: token.foreground }]} />
      <Text variant="label" style={{ color: token.foreground, textTransform: 'uppercase' }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
