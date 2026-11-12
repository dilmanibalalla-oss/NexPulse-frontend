import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components/Text';
import { useAppTheme } from '@/shared/theme';

type StatusDotProps = {
  color: string;
  label: string;
};

export function StatusDot({ color, label }: StatusDotProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.row, { gap: theme.spacing.sm }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="body">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
