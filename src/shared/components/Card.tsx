import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/shared/theme';

type CardAccent = 'blue' | 'purple';

type CardProps = {
  children: ReactNode;
  variant?: 'surface' | 'raised';
  accent?: CardAccent;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  variant = 'surface',
  accent,
  padded = true,
  style,
}: CardProps) {
  const theme = useAppTheme();
  const accentColor =
    accent === 'purple' ? theme.colors.purple : accent === 'blue' ? theme.colors.accent : undefined;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variant === 'raised' ? theme.colors.surfaceRaised : theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          padding: padded ? theme.spacing.lg : theme.spacing.none,
          gap: theme.spacing.sm,
        },
        accentColor
          ? {
              borderLeftWidth: 3,
              borderLeftColor: accentColor,
            }
          : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    width: '100%',
  },
});
