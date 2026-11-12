import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/components/Text';
import { useAppTheme } from '@/shared/theme';

export function BootScreen() {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="label">NexPulse</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
