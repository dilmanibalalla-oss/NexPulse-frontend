import { colors } from '@/shared/theme/colors';
import { radius, spacing } from '@/shared/theme/spacing';
import { typography } from '@/shared/theme/typography';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
} as const;

export type AppTheme = typeof theme;
