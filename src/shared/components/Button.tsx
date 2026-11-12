import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/shared/components/Text';
import { useAppTheme } from '@/shared/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: NonNullable<PressableProps['onPress']>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const theme = useAppTheme();
  const inactive = disabled || loading;
  const appearance = buttonAppearance(variant, theme.colors);
  const minHeight = size === 'lg' ? theme.layout.controlHeightLarge : theme.layout.controlHeight;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      android_ripple={{ color: theme.colors.accentMuted }}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight,
          paddingHorizontal: size === 'lg' ? theme.spacing.xl : theme.spacing.lg,
          borderRadius: theme.radius.lg,
          backgroundColor: appearance.background,
          borderColor: appearance.border,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        pressed && !inactive ? styles.pressed : null,
        inactive ? styles.inactive : null,
        style,
      ]}
    >
      <View style={styles.content}>
        <Text variant="button" style={{ color: appearance.label, opacity: loading ? 0 : 1 }}>
          {label}
        </Text>
        {loading ? (
          <View style={styles.spinner} pointerEvents="none">
            <ActivityIndicator color={appearance.spinner} size="small" />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function buttonAppearance(
  variant: ButtonVariant,
  colors: {
    accent: string;
    surfaceRaised: string;
    border: string;
    text: string;
    textInverse: string;
    transparent: string;
    down: string;
    downMuted: string;
  },
) {
  switch (variant) {
    case 'secondary':
      return {
        background: colors.surfaceRaised,
        border: colors.border,
        label: colors.text,
        spinner: colors.accent,
      };
    case 'ghost':
      return {
        background: colors.transparent,
        border: colors.transparent,
        label: colors.accent,
        spinner: colors.accent,
      };
    case 'danger':
      return {
        background: colors.downMuted,
        border: colors.down,
        label: colors.down,
        spinner: colors.down,
      };
    case 'primary':
      return {
        background: colors.accent,
        border: colors.accent,
        label: colors.textInverse,
        spinner: colors.textInverse,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
  inactive: {
    opacity: 0.4,
  },
});
