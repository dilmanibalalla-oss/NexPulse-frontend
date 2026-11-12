import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

import { useAppTheme, type TextVariant } from '@/shared/theme';

type TextProps = NativeTextProps & {
  variant?: TextVariant;
};

export function Text({ variant = 'body', style, ...rest }: TextProps) {
  const theme = useAppTheme();
  const color =
    variant === 'label'
      ? theme.colors.accent
      : variant === 'muted'
        ? theme.colors.textMuted
        : theme.colors.text;

  return <NativeText {...rest} style={[theme.typography[variant], { color }, style]} />;
}
