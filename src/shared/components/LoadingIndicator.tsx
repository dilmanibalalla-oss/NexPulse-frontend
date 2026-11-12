import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components/Text';
import { useAppTheme } from '@/shared/theme';

type LoadingIndicatorProps = {
  label?: string;
  size?: 'small' | 'large';
  centered?: boolean;
};

export function LoadingIndicator({
  label,
  size = 'small',
  centered = false,
}: LoadingIndicatorProps) {
  const theme = useAppTheme();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Loading'}
      style={[styles.row, { gap: theme.spacing.sm }, centered ? styles.centered : null]}
    >
      <ActivityIndicator color={theme.colors.accent} size={size} />
      {label ? <Text variant="muted">{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
});
