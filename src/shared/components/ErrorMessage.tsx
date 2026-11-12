import { StyleSheet, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { Text } from '@/shared/components/Text';
import { useAppTheme } from '@/shared/theme';

type ErrorMessageProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorMessage({
  message,
  title,
  onRetry,
  retryLabel = 'Try again',
}: ErrorMessageProps) {
  const theme = useAppTheme();

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.dangerMuted,
          borderColor: theme.colors.danger,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          gap: theme.spacing.sm,
        },
      ]}
    >
      {title ? (
        <Text variant="heading" style={{ color: theme.colors.danger }}>
          {title}
        </Text>
      ) : null}
      <Text variant="body">{message}</Text>
      {onRetry ? <Button label={retryLabel} onPress={onRetry} variant="danger" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    width: '100%',
  },
});
