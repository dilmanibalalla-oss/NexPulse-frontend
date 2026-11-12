import { DarkTheme, type Theme } from 'expo-router';

import { colors } from '@/shared/theme/colors';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.down,
  },
};
