import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';

import { useAppTheme, type TextVariant } from '@/shared/theme';

type TextProps = NativeTextProps & {
  variant?: TextVariant;
};

export function Text({ variant = 'body', style, ...rest }: TextProps) {
  const theme = useAppTheme();

  return (
    <NativeText
      {...rest}
      style={[theme.typography[variant], { color: colorForVariant(variant, theme.colors) }, style]}
    />
  );
}

function colorForVariant(
  variant: TextVariant,
  colors: { accent: string; text: string; textMuted: string },
): string {
  if (variant === 'label') {
    return colors.accent;
  }

  if (variant === 'muted' || variant === 'caption') {
    return colors.textMuted;
  }

  return colors.text;
}
